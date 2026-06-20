using System.Text;
using System.Text.Json;
using Backend.Configurations;
using Backend.Dtos;
using Microsoft.Extensions.Options;

namespace Backend.Service;

public class AiSuggestionService : IAiSuggestionService
{
    private readonly HttpClient _httpClient;
    private readonly OllamaSettings _settings;
    private readonly ILogger<AiSuggestionService> _logger;

    private static readonly HashSet<string> AllowedCategories =
    [
        "Work",
        "Personal",
        "Health",
        "Shopping",
        "Urgent",
        "Other"
    ];

    public AiSuggestionService(
        HttpClient httpClient,
        IOptions<OllamaSettings> settings,
        ILogger<AiSuggestionService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<AiSuggestionResponse> SuggestAsync(string title)
    {
        try
        {
            var prompt = $$"""
                You are a todo assistant.

                Analyze the user's todo title.

                Return ONLY valid JSON.

                You MUST choose EXACTLY ONE category from:

                Work
                Personal
                Health
                Shopping
                Urgent
                Other

                Do not invent new categories.

                Return ONLY valid JSON.

                Response Json format:

                {
                  "suggestedTitle": "",
                  "category": ""
                }

                User title:
                {{title}}
                """;

            var request = new OllamaGenerateRequest
            {
                Model = _settings.Model,
                Prompt = prompt,
                Stream = false
            };

            var json = JsonSerializer.Serialize(request);

            var content = new StringContent(
                json,
                Encoding.UTF8,
                "application/json");

            var response = await _httpClient.PostAsync(
                $"{_settings.BaseUrl}/api/generate",
                content);

            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();

            var ollamaResponse = JsonSerializer.Deserialize<OllamaGenerateResponse>(responseContent);

            _logger.LogInformation("Raw Ollama Response: {Response}", ollamaResponse?.Response);

            if (string.IsNullOrWhiteSpace(ollamaResponse?.Response))
            {
                return CreateFallbackResponse(
                    title,
                    "Empty response received from AI.");
            }

            var suggestion =
                JsonSerializer.Deserialize<AiSuggestionResponse>(
                    ollamaResponse.Response,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

            if (suggestion == null)
            {
                return CreateFallbackResponse(
                    title,
                    "Unable to parse AI response.");
            }

            if (!AllowedCategories.Contains(suggestion.Category))
            {
                suggestion.Category = "Other";
            }

            suggestion.Success = true;
            suggestion.Message = null;

            return suggestion;
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogWarning(
                ex,
                "AI suggestion request timed out.");

            return CreateFallbackResponse(
                title,
                "AI request timed out.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(
                ex,
                "Unable to connect to Ollama.");

            return CreateFallbackResponse(
                title,
                "AI service unavailable.");
        }
        catch (JsonException ex)
        {
            _logger.LogError(
                ex,
                "Failed to parse AI response.");

            return CreateFallbackResponse(
                title,
                "Invalid AI response format.");
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unexpected error generating suggestion for title: {Title}",
                title);

            return CreateFallbackResponse(
                title,
                "Unexpected AI error.");
        }
    }

    private static AiSuggestionResponse CreateFallbackResponse(
        string originalTitle,
        string message)
    {
        return new AiSuggestionResponse
        {
            SuggestedTitle = originalTitle,
            Category = "Other",
            Success = false,
            Message = message
        };
    }
}