using FluentResults;

namespace CmAgency.Errors;

public class InternalError(string message) : Error(message) { }
