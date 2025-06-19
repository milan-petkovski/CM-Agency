using FluentResults;

namespace CmAgency.Errors;

public class BadRequest(string message) : Error(message) { }
