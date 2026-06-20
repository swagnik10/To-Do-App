using System.Text.Json.Serialization;

namespace Backend.Dtos;

public class OllamaGenerateRequest
{
    public string Model { get; set; } = string.Empty;

    public string Prompt { get; set; } = string.Empty;

    public bool Stream { get; set; }

    [JsonPropertyName("format")]
    public string Format { get; set; } = "json";
}
