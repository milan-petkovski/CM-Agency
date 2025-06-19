using FluentResults;

namespace CmAgency.Errors;

public class NotFound(string message) : Error(message) { }
