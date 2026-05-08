# Architecture Review — scenario-a-review

## Modifiability

| Criterion | Assessment | Motivation |
|-----------|------------|------------|
| Clear layering (API, service, and repository layers). | Not met | The code does not have distinct API, service, and repository layers. |
| Each layer has a bounded responsibility. | Not met | The API layer contains validation, business logic, database interaction, and response construction. |
| Centralised error handling. | Partially met | A centralised error handling mechanism handles thrown errors; some error responses are still produced directly in the API layer. |
| Changes in business logic do not affect the API layer. | Not met | Business logic is implemented in the API layer. |
| The API contract can change independently of the internal data model. | Partially met | API responses are mapped away from the internal data model; contract handling and internal data model access remain coupled in the API layer. |
| No direct dependency between non-adjacent layers. | Not met | The API layer depends directly on the repository layer responsibility. |

## Testability

| Criterion | Assessment | Motivation |
|-----------|------------|------------|
| Each layer can be tested independently of the other layers. | Not met | The named layers are not separated in a way that supports independent testing. |
| Dependencies can be replaced with mocks. | Not met | Dependencies are created as concrete module-level dependencies rather than replaceable layer dependencies. |

## Security

| Criterion | Assessment | Motivation |
|-----------|------------|------------|
| Validation of incoming data in the API layer. | Met | Incoming data is validated in the API layer before business logic is executed. |
| Error messages contain no internal details. | Met | Error responses expose request-level and domain-level messages while unexpected internal failures are replaced with a generic message. |
| Internal database models are not exposed in API responses. | Met | API responses are constructed from selected fields rather than returning internal database models directly. |
| DTOs are used as the interface between internal and external data structures. | Not met | DTOs are not established as the interface between internal and external data structures. |

## Functionality

| Criterion | Assessment | Motivation |
|-----------|------------|------------|
| The endpoint for creating orders works according to the specification. | Met | The endpoint validates the request, creates an order, stores order items, updates stock, and returns the specified confirmation structure. |
| Correct handling of data and status codes. | Met | Successful, invalid, missing, conflict, and unexpected outcomes are mapped to the specified data shapes and status codes. |

## Summary

| Quality attribute | Met | Partially met | Not met |
|-------------------|----:|--------------:|--------:|
| Modifiability     |   0 |             2 |       4 |
| Testability       |   0 |             0 |       2 |
| Security          |   3 |             0 |       1 |
| Functionality     |   2 |             0 |       0 |

**Total architectural deviations:** 9
