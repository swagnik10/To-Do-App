using System.Text.Json;
using Backend.Configurations;
using Backend.Dtos;
using Microsoft.Extensions.Options;

namespace Backend.Service;

public class AiSuggestionService : IAiSuggestionService
{
    private readonly HttpClient _httpClient;
    private readonly GeminiSettings _settings;
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
        IOptions<GeminiSettings> settings,
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
                    You are an intelligent todo assistant.

                    Your job is to rewrite the user's todo title into a clear, natural, and meaningful task.

                    Rules:

                    - Rewrite the title into a complete and meaningful sentence.
                    - The suggested title MUST contain at least 6 words.
                    - Keep the original intent of the user's task.
                    - Do NOT add unrelated information.
                    - Do NOT make the task excessively long.
                    - Use proper grammar and capitalization.
                    - The title should sound like something a person would actually write in a todo list.

                    You MUST choose EXACTLY ONE category from:

                    - Work
                    - Personal
                    - Health
                    - Shopping
                    - Urgent
                    - Other

                    Do NOT invent new categories.

                    Return ONLY valid JSON.

                    Response format:

                    {
                      "suggestedTitle": "",
                      "category": ""
                    }

                    Examples:

                    Input:
                    buy milk

                    Output:
                    {
                      "suggestedTitle": "Buy fresh milk from the grocery store",
                      "category": "Shopping"
                    }

                    Input:
                    gym

                    Output:
                    {
                      "suggestedTitle": "Go to the gym for today's workout",
                      "category": "Health"
                    }

                    Input:
                    meeting

                    Output:
                    {
                      "suggestedTitle": "Attend the scheduled project team meeting",
                      "category": "Work"
                    }

                    Input:
                    call mom

                    Output:
                    {
                      "suggestedTitle": "Call my mother to check how she is doing",
                      "category": "Personal"
                    }

                    User title:
                    {{title}}
                    """;

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new
                            {
                                text = prompt
                            }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.3,
                    responseMimeType = "application/json"
                }
            };

            var endpoint =
                $"https://generativelanguage.googleapis.com/v1beta/models/{_settings.Model}:generateContent?key={_settings.ApiKey}";

            var response = await _httpClient.PostAsJsonAsync(
                endpoint,
                requestBody);

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();

            using var document = JsonDocument.Parse(json);

            var aiResponse =
                document.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

            _logger.LogInformation("Raw Gemini Response: {Response}", aiResponse);

            if (string.IsNullOrWhiteSpace(aiResponse))
            {
                return CreateFallbackResponse(
                    title,
                    "Empty response received from AI.");
            }

            var suggestion =
                JsonSerializer.Deserialize<AiSuggestionResponse>(
                    aiResponse,
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
            _logger.LogWarning(ex, "Gemini request timed out.");

            return CreateFallbackResponse(
                title,
                "AI request timed out.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Unable to connect to Gemini.");

            return CreateFallbackResponse(
                title,
                "AI service unavailable.");
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to parse Gemini response.");

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