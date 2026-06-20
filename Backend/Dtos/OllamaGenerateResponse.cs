using System.Text.Json.Serialization;

namespace Backend.Dtos;

public class OllamaGenerateResponse
{
    [JsonPropertyName("response")]
    public string Response { get; set; } = string.Empty;
}
