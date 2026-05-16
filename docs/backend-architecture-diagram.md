# BobForge Backend Architecture Diagrams

## System Overview

```mermaid
graph TB
    Client[Frontend Client]
    API[Express API Server]
    Routes[Route Handlers]
    Controllers[Controllers]
    Services[Services]
    Generators[Generator Pipeline]
    Storage[JSON Storage]
    
    Client -->|HTTP Requests| API
    API --> Routes
    Routes --> Controllers
    Controllers --> Services
    Services --> Generators
    Services --> Storage
    Generators -->|Context Flow| Generators
    Storage -->|Read/Write| Files[(JSON Files)]
```

## Request Flow - Blueprint Generation

```mermaid
sequenceDiagram
    participant Client
    participant Route as blueprint.routes.js
    participant Controller as blueprint.controller.js
    participant Service as blueprint.service.js
    participant Generators as Generator Pipeline
    participant Storage as storage.service.js
    participant Files as JSON Files
    
    Client->>Route: POST /api/blueprints/generate
    Route->>Controller: generateBlueprint(req, res)
    Controller->>Controller: Validate idea input
    Controller->>Service: generateBlueprint(idea)
    
    Service->>Generators: Execute Pipeline
    
    Note over Generators: Sequential Execution
    Generators->>Generators: 1. Process Idea
    Generators->>Generators: 2. Generate PRD
    Generators->>Generators: 3. Generate Architecture
    Generators->>Generators: 4. Generate Schema
    Generators->>Generators: 5. Generate API Plan
    Generators->>Generators: 6. Generate Frontend Plan
    Generators->>Generators: 7. Generate Test Plan
    Generators->>Generators: 8. Generate Deployment Plan
    Generators->>Generators: 9. Generate Bob Prompt
    
    Generators-->>Service: Complete Blueprint
    Service->>Storage: saveBlueprint(blueprint)
    Storage->>Files: Write to blueprints.json
    Files-->>Storage: Success
    Storage-->>Service: Blueprint Saved
    Service-->>Controller: Blueprint Object
    Controller-->>Route: JSON Response
    Route-->>Client: 200 OK + Blueprint
```

## Generator Pipeline Architecture

```mermaid
graph LR
    Input[Idea Input]
    
    Input --> PRD[PRD Generator]
    PRD --> Arch[Architecture Generator]
    Arch --> Schema[Schema Generator]
    Schema --> API[API Plan Generator]
    API --> Frontend[Frontend Plan Generator]
    Frontend --> Tests[Test Plan Generator]
    Tests --> Deploy[Deployment Plan Generator]
    Deploy --> Bob[Bob Prompt Generator]
    Bob --> Output[Complete Blueprint]
    
    style Input fill:#e1f5ff
    style Output fill:#c8e6c9
    style PRD fill:#fff9c4
    style Arch fill:#fff9c4
    style Schema fill:#fff9c4
    style API fill:#fff9c4
    style Frontend fill:#fff9c4
    style Tests fill:#fff9c4
    style Deploy fill:#fff9c4
    style Bob fill:#fff9c4
```

## Context Object Flow

```mermaid
graph TD
    C1[Context: idea]
    C2[Context: idea + prd]
    C3[Context: idea + prd + architecture]
    C4[Context: idea + prd + architecture + schema]
    C5[Context: idea + prd + architecture + schema + api]
    C6[Context: idea + prd + architecture + schema + api + frontend]
    C7[Context: idea + prd + architecture + schema + api + frontend + tests]
    C8[Context: idea + prd + architecture + schema + api + frontend + tests + deployment]
    C9[Context: Complete with all artifacts + bobPrompt]
    
    C1 -->|PRD Generator| C2
    C2 -->|Architecture Generator| C3
    C3 -->|Schema Generator| C4
    C4 -->|API Generator| C5
    C5 -->|Frontend Generator| C6
    C6 -->|Test Generator| C7
    C7 -->|Deployment Generator| C8
    C8 -->|Bob Prompt Generator| C9
```

## File System Structure

```mermaid
graph TD
    Root[backend/]
    
    Root --> Src[src/]
    Root --> Package[package.json]
    Root --> Env[.env.example]
    Root --> Git[.gitignore]
    Root --> Readme[README.md]
    
    Src --> Server[server.js]
    Src --> App[app.js]
    Src --> Routes[routes/]
    Src --> Controllers[controllers/]
    Src --> Services[services/]
    Src --> Generators[generators/]
    Src --> Utils[utils/]
    Src --> Data[data/]
    
    Routes --> R1[health.routes.js]
    Routes --> R2[blueprint.routes.js]
    Routes --> R3[artifact.routes.js]
    
    Controllers --> C1[blueprint.controller.js]
    Controllers --> C2[artifact.controller.js]
    
    Services --> S1[storage.service.js]
    Services --> S2[blueprint.service.js]
    Services --> S3[artifact.service.js]
    
    Generators --> G1[prdGenerator.js]
    Generators --> G2[architectureGenerator.js]
    Generators --> G3[schemaGenerator.js]
    Generators --> G4[apiPlanGenerator.js]
    Generators --> G5[frontendPlanGenerator.js]
    Generators --> G6[testPlanGenerator.js]
    Generators --> G7[deploymentPlanGenerator.js]
    Generators --> G8[bobPromptGenerator.js]
    
    Utils --> U1[slugify.js]
    Utils --> U2[validators.js]
    
    Data --> D1[blueprints.json]
    Data --> D2[artifacts.json]
```

## API Endpoint Structure

```mermaid
graph LR
    API[Express API]
    
    API --> Health[/api/health]
    API --> Blueprints[/api/blueprints]
    API --> Artifacts[/api/artifacts]
    
    Blueprints --> BP1[POST /generate]
    Blueprints --> BP2[GET /]
    Blueprints --> BP3[GET /:id]
    Blueprints --> BP4[GET /:id/export/markdown]
    
    Artifacts --> A1[POST /]
    Artifacts --> A2[GET /]
    Artifacts --> A3[GET /:id]
    
    Health --> H1[GET /]
```

## Data Model Relationships

```mermaid
erDiagram
    BLUEPRINT ||--o{ ARTIFACT : contains
    BLUEPRINT {
        string projectId PK
        string createdAt
        string updatedAt
        object idea
        object artifacts
        object metadata
    }
    ARTIFACT {
        string artifactId PK
        string projectId FK
        string type
        object content
        string createdAt
        string updatedAt
    }
```

## Error Handling Flow

```mermaid
graph TD
    Request[Incoming Request]
    Validation{Input Valid?}
    Processing[Process Request]
    Error{Error Occurred?}
    Success[Success Response]
    ValidationError[400 Bad Request]
    NotFound[404 Not Found]
    ServerError[500 Internal Error]
    
    Request --> Validation
    Validation -->|No| ValidationError
    Validation -->|Yes| Processing
    Processing --> Error
    Error -->|No| Success
    Error -->|Not Found| NotFound
    Error -->|Other| ServerError
```

## Middleware Stack

```mermaid
graph TD
    Request[HTTP Request]
    
    Request --> CORS[CORS Middleware]
    CORS --> JSON[JSON Parser]
    JSON --> Routes[Route Handler]
    Routes --> Controller[Controller Logic]
    Controller --> Response[HTTP Response]
    
    Controller -.->|Error| ErrorHandler[Error Handler Middleware]
    ErrorHandler -.-> ErrorResponse[Error Response]
```

## Storage Service Operations

```mermaid
graph LR
    Service[Storage Service]
    
    Service --> Read[Read Operations]
    Service --> Write[Write Operations]
    Service --> Delete[Delete Operations]
    
    Read --> R1[readBlueprints]
    Read --> R2[readBlueprintById]
    Read --> R3[readArtifacts]
    Read --> R4[readArtifactById]
    
    Write --> W1[saveBlueprint]
    Write --> W2[updateBlueprint]
    Write --> W3[saveArtifact]
    
    Delete --> D1[deleteBlueprint]
    Delete --> D2[deleteArtifact]
    
    R1 --> Files[(JSON Files)]
    R2 --> Files
    R3 --> Files
    R4 --> Files
    W1 --> Files
    W2 --> Files
    W3 --> Files
    D1 --> Files
    D2 --> Files
```

## Generator Module Pattern

```mermaid
graph TD
    Input[Context Input]
    
    Input --> Validate[Validate Context]
    Validate --> Extract[Extract Relevant Data]
    Extract --> Generate[Generate Artifact]
    Generate --> ValidateOutput[Validate Output]
    ValidateOutput --> Enhance[Enhance Context]
    Enhance --> Output[Return Enhanced Context]
    
    style Input fill:#e1f5ff
    style Output fill:#c8e6c9
```

## Deployment Architecture

```mermaid
graph TB
    Dev[Development]
    Prod[Production]
    
    Dev --> DevServer[Local Server :3001]
    DevServer --> DevData[Local JSON Files]
    
    Prod --> ProdServer[Production Server]
    ProdServer --> ProdData[Persistent Storage]
    ProdServer --> Monitoring[Monitoring/Logging]
```

## Security Layers

```mermaid
graph TD
    Request[HTTP Request]
    
    Request --> CORS[CORS Check]
    CORS --> Validation[Input Validation]
    Validation --> Sanitization[Data Sanitization]
    Sanitization --> Processing[Business Logic]
    Processing --> Response[Response]
    
    CORS -.->|Fail| Reject1[403 Forbidden]
    Validation -.->|Fail| Reject2[400 Bad Request]
    Sanitization -.->|Fail| Reject3[400 Bad Request]
```

## Testing Strategy

```mermaid
graph LR
    Tests[Test Suite]
    
    Tests --> Unit[Unit Tests]
    Tests --> Integration[Integration Tests]
    Tests --> E2E[E2E Tests]
    
    Unit --> Generators[Generator Tests]
    Unit --> Services[Service Tests]
    Unit --> Utils[Utility Tests]
    
    Integration --> API[API Tests]
    Integration --> Storage[Storage Tests]
    
    E2E --> Flow[Complete Flow Tests]
```

## IBM Bob Integration Points

```mermaid
graph TD
    Start[Project Start]
    
    Start --> Planning[Planning Phase]
    Planning --> Coding[Coding Phase]
    Coding --> Testing[Testing Phase]
    Testing --> Deploy[Deployment Phase]
    
    Planning --> Report1[Session Report 1]
    Coding --> Report2[Session Report 2]
    Testing --> Report3[Session Report 3]
    Deploy --> Report4[Session Report 4]
    
    Report1 --> Storage[bob_sessions/]
    Report2 --> Storage
    Report3 --> Storage
    Report4 --> Storage
    
    Storage --> Dashboard[IBM Bob Dashboard]
```

## Performance Optimization Strategy

```mermaid
graph TD
    MVP[MVP Version]
    Future[Future Optimization]
    
    MVP --> Sync[Synchronous Operations]
    MVP --> NoCache[No Caching]
    MVP --> Simple[Simple File I/O]
    
    Future --> Async[Async Operations]
    Future --> Cache[In-Memory Cache]
    Future --> Stream[Streaming Large Files]
    Future --> Queue[Background Jobs]
```
