using System.Text;
using System.Text.Json;
using Backend.Configurations;
using Backend.Dtos;
using Microsoft.Extensions.Options;

namespace Backend.Service;

public class AiBulkActionService : IAiBulkActionService
{
    private readonly HttpClient _httpClient;
    private readonly GeminiSettings _settings;
    private readonly ILogger<AiBulkActionService> _logger;

    private static readonly HashSet<string> AllowedCategories =
    [
        "Work",
        "Personal",
        "Health",
        "Shopping",
        "Urgent",
        "Other"
    ];

    private static readonly HashSet<string> AllowedActions =
    [
        "complete",
        "delete",
        "select",
        "uncomplete"
    ];

    public AiBulkActionService(
        HttpClient httpClient,
        IOptions<GeminiSettings> settings,
        ILogger<AiBulkActionService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<AiBulkActionResponse> ParseAsync(string command)
    {
        try
        {
            var prompt = $$"""
            You are a todo command parser.

            Your job is to convert a user's natural language command into structured JSON.

            Supported actions:

            - complete
            - uncomplete
            - delete
            - select

            Supported categories:

            - Work
            - Personal
            - Health
            - Shopping
            - Urgent
            - Other

            Return ONLY valid JSON.

            Rules:

            1. Choose EXACTLY ONE action from:
               complete, uncomplete, delete, select

            2. If the command clearly means:
               - done, completed, finish -> complete
               - not done, incomplete, undo completion -> uncomplete
               - remove, delete -> delete
               - show, list, mark, find -> select

            3. If no category is mentioned, return null for category.

            4. Do NOT invent categories.

            5. If the action cannot be determined with confidence, return null for action.

            Response format:

            {
              "action": "",
              "category": null
            }

            User command:
            {{command}}
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
                    temperature = 0.2,
                    responseMimeType = "application/json"
                }
            };

            var endpoint =
                $"https://generativelanguage.googleapis.com/v1beta/models/{_settings.Model}:generateContent?key={_settings.ApiKey}";

            var response = await _httpClient.PostAsJsonAsync(
                endpoint,
                requestBody);

            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();

            using var document = JsonDocument.Parse(responseContent);

            var aiResponse =
                document.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

            _logger.LogInformation(
                "Raw Gemini Bulk Action Response: {Response}",
                aiResponse);

            if (string.IsNullOrWhiteSpace(aiResponse))
            {
                return CreateFallbackResponse(
                    "Empty response received from AI.");
            }

            var parsedAction =
                JsonSerializer.Deserialize<AiBulkActionResponse>(
                    aiResponse,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

            if (parsedAction == null)
            {
                return CreateFallbackResponse(
                    "Unable to parse AI response.");
            }

            if (string.IsNullOrWhiteSpace(parsedAction.Action))
            {
                return CreateFallbackResponse(
                    "Action not found.");
            }

            parsedAction.Action = parsedAction.Action.ToLowerInvariant();

            if (!AllowedActions.Contains(parsedAction.Action))
            {
                return CreateFallbackResponse(
                    $"Unsupported action '{parsedAction.Action}'.");
            }

            if (!string.IsNullOrWhiteSpace(parsedAction.Category) &&
                !AllowedCategories.Contains(parsedAction.Category))
            {
                parsedAction.Category = null;
            }

            parsedAction.Success = true;
            parsedAction.Message = null;

            return parsedAction;
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogWarning(
                ex,
                "Gemini bulk action request timed out.");

            return CreateFallbackResponse(
                "AI request timed out.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(
                ex,
                "Unable to connect to Gemini.");

            return CreateFallbackResponse(
                "AI service unavailable.");
        }
        catch (JsonException ex)
        {
            _logger.LogError(
                ex,
                "Failed to parse Gemini response.");

            return CreateFallbackResponse(
                "Invalid AI response format.");
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unexpected error parsing command: {Command}",
                command);

            return CreateFallbackResponse(
                "Unexpected AI error.");
        }
    }

    private static AiBulkActionResponse CreateFallbackResponse(
        string message)
    {
        return new AiBulkActionResponse
        {
            Action = string.Empty,
            Category = null,
            Success = false,
            Message = message
        };
    }
}