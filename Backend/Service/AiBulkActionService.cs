using System.Text;
using System.Text.Json;
using Backend.Configurations;
using Backend.Dtos;
using Microsoft.Extensions.Options;

namespace Backend.Service;

public class AiBulkActionService : IAiBulkActionService
{
    private readonly HttpClient _httpClient;
    private readonly OllamaSettings _settings;
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
        IOptions<OllamaSettings> settings,
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
                               - show, list, mark, select, find -> select

                            3. If no category is mentioned, return null for category.

                            4. Do NOT invent categories.

                            5. If the action cannot be determined with confidence, return null for action.

                            6. Return ONLY JSON.

                            Response format:

                            {
                              "action": "",
                              "category": null
                            }

                            Examples:

                            User:
                            Mark all shopping todos as done

                            Output:
                            {
                              "action": "complete",
                              "category": "Shopping"
                            }

                            User:
                            Complete all shopping tasks

                            Output:
                            {
                              "action": "complete",
                              "category": "Shopping"
                            }

                            User:
                            Delete all work tasks

                            Output:
                            {
                              "action": "delete",
                              "category": "Work"
                            }

                            User:
                            Remove all urgent todos

                            Output:
                            {
                              "action": "delete",
                              "category": "Urgent"
                            }

                            User:
                            Mark all shopping todos

                            Output:
                            {
                              "action": "select",
                              "category": "Shopping"
                            }

                            User:
                            Show all shopping todos

                            Output:
                            {
                              "action": "select",
                              "category": "Shopping"
                            }

                            User:
                            List all personal tasks

                            Output:
                            {
                              "action": "select",
                              "category": "Personal"
                            }

                            User:
                            Mark all shopping todos as not done

                            Output:
                            {
                              "action": "uncomplete",
                              "category": "Shopping"
                            }

                            User:
                            Mark all work tasks as incomplete

                            Output:
                            {
                              "action": "uncomplete",
                              "category": "Work"
                            }

                            User:
                            Undo completion of health tasks

                            Output:
                            {
                              "action": "uncomplete",
                              "category": "Health"
                            }

                            User:
                            Delete everything

                            Output:
                            {
                              "action": "delete",
                              "category": null
                            }

                            User:
                            Show all todos

                            Output:
                            {
                              "action": "select",
                              "category": null
                            }

                            User command:
                            {{command}}
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

            _logger.LogInformation("Raw Ollama Bulk Action Response: {Response}", ollamaResponse?.Response);

            if (string.IsNullOrWhiteSpace(ollamaResponse?.Response))
            {
                return CreateFallbackResponse(
                    "Empty response received from AI.");
            }

            var parsedAction =
                JsonSerializer.Deserialize<AiBulkActionResponse>(
                    ollamaResponse.Response,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

            if (parsedAction == null)
            {
                return CreateFallbackResponse(
                    "Unable to parse AI response.");
            }

            if (string.IsNullOrWhiteSpace(
                parsedAction.Action))
            {
                return CreateFallbackResponse(
                    "Action not found.");
            }

            parsedAction.Action =
                parsedAction.Action.ToLower();

            if (!AllowedActions.Contains(
                parsedAction.Action))
            {
                return CreateFallbackResponse(
                    $"Unsupported action '{parsedAction.Action}'.");
            }

            if (!string.IsNullOrWhiteSpace(
                parsedAction.Category) &&
                !AllowedCategories.Contains(
                    parsedAction.Category))
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
                "AI bulk action request timed out.");

            return CreateFallbackResponse(
                "AI request timed out.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(
                ex,
                "Unable to connect to Ollama.");

            return CreateFallbackResponse(
                "AI service unavailable.");
        }
        catch (JsonException ex)
        {
            _logger.LogError(
                ex,
                "Failed to parse AI response.");

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