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

                        Response format:

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

            var responseContent =
                await response.Content.ReadAsStringAsync();

            var ollamaResponse =
                JsonSerializer.Deserialize<OllamaGenerateResponse>(
                    responseContent);

            _logger.LogInformation(
                "Raw Ollama Response: {Response}",
                ollamaResponse?.Response);

            if (string.IsNullOrWhiteSpace(ollamaResponse?.Response))
            {
                return new AiSuggestionResponse
                {
                    SuggestedTitle = title,
                    Category = "Other"
                };
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
                return new AiSuggestionResponse
                {
                    SuggestedTitle = title,
                    Category = "Other"
                };
            }

            return suggestion;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error generating AI suggestion for title: {Title}",
                title);

            return new AiSuggestionResponse
            {
                SuggestedTitle = title,
                Category = "Other"
            };
        }
    }
}