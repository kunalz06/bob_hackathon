/**
 * Schema Generator
 * Generates database schema design from architecture
 */

/**
 * Generate database schema from context
 * @param {Object} context - Accumulated context including architecture
 * @returns {Object} Enhanced context with schema artifact
 */
async function generate(context) {
  validateContext(context);
  const input = extractInput(context);
  const schema = await generateSchema(input);
  validateSchema(schema);
  
  return {
    ...context,
    schema
  };
}

function validateContext(context) {
  if (!context.architecture) {
    throw new Error('Context must include architecture');
  }
}

function extractInput(context) {
  return {
    title: context.idea.processed.title,
    features: context.prd.features || [],
    techStack: context.architecture.techStack || {}
  };
}

async function generateSchema(input) {
  // Determine if authentication is needed
  const hasAuth = input.features.some(f => 
    f.name.toLowerCase().includes('auth') || 
    f.name.toLowerCase().includes('login') ||
    f.name.toLowerCase().includes('user')
  );

  const tables = [];

  // Always include Users table if auth is needed
  if (hasAuth) {
    tables.push({
      name: 'users',
      description: 'User accounts and authentication',
      columns: [
        { name: 'id', type: 'UUID', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'email', type: 'VARCHAR(255)', unique: true, nullable: false },
        { name: 'password_hash', type: 'VARCHAR(255)', nullable: false },
        { name: 'first_name', type: 'VARCHAR(100)', nullable: true },
        { name: 'last_name', type: 'VARCHAR(100)', nullable: true },
        { name: 'role', type: 'VARCHAR(50)', default: "'user'", nullable: false },
        { name: 'is_active', type: 'BOOLEAN', default: 'true', nullable: false },
        { name: 'email_verified', type: 'BOOLEAN', default: 'false', nullable: false },
        { name: 'created_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP', nullable: false },
        { name: 'updated_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP', nullable: false }
      ],
      indexes: [
        { name: 'idx_users_email', columns: ['email'], unique: true },
        { name: 'idx_users_role', columns: ['role'] }
      ]
    });
  }

  // Add feature-specific tables
  input.features.forEach((feature, index) => {
    const tableName = feature.name.toLowerCase().replace(/\s+/g, '_');
    
    tables.push({
      name: tableName,
      description: `Data for ${feature.name}`,
      columns: [
        { name: 'id', type: 'UUID', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'name', type: 'VARCHAR(255)', nullable: false },
        { name: 'description', type: 'TEXT', nullable: true },
        { name: 'status', type: 'VARCHAR(50)', default: "'active'", nullable: false },
        ...(hasAuth ? [{ name: 'user_id', type: 'UUID', nullable: false, foreignKey: 'users(id)' }] : []),
        { name: 'created_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP', nullable: false },
        { name: 'updated_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP', nullable: false }
      ],
      indexes: [
        { name: `idx_${tableName}_status`, columns: ['status'] },
        ...(hasAuth ? [{ name: `idx_${tableName}_user_id`, columns: ['user_id'] }] : [])
      ]
    });
  });

  // Add audit log table
  tables.push({
    name: 'audit_logs',
    description: 'System audit trail',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'entity_type', type: 'VARCHAR(100)', nullable: false },
      { name: 'entity_id', type: 'UUID', nullable: false },
      { name: 'action', type: 'VARCHAR(50)', nullable: false },
      { name: 'changes', type: 'JSONB', nullable: true },
      ...(hasAuth ? [{ name: 'user_id', type: 'UUID', nullable: true, foreignKey: 'users(id)' }] : []),
      { name: 'ip_address', type: 'VARCHAR(45)', nullable: true },
      { name: 'user_agent', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP', nullable: false }
    ],
    indexes: [
      { name: 'idx_audit_logs_entity', columns: ['entity_type', 'entity_id'] },
      { name: 'idx_audit_logs_created_at', columns: ['created_at'] }
    ]
  });

  const relationships = [];
  
  if (hasAuth) {
    input.features.forEach(feature => {
      const tableName = feature.name.toLowerCase().replace(/\s+/g, '_');
      relationships.push({
        from: tableName,
        to: 'users',
        type: 'many-to-one',
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    });

    relationships.push({
      from: 'audit_logs',
      to: 'users',
      type: 'many-to-one',
      foreignKey: 'user_id',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  }

  return {
    database: input.techStack.database?.primary || 'PostgreSQL',
    version: '14+',
    tables,
    relationships,
    indexes: tables.flatMap(table => 
      table.indexes.map(idx => ({
        table: table.name,
        ...idx
      }))
    ),
    migrations: [
      {
        version: '001',
        description: 'Initial schema creation',
        up: 'Create all tables with indexes and relationships',
        down: 'Drop all tables'
      },
      {
        version: '002',
        description: 'Add audit logging',
        up: 'Create audit_logs table',
        down: 'Drop audit_logs table'
      }
    ],
    seedData: hasAuth ? [
      {
        table: 'users',
        description: 'Default admin user',
        data: {
          email: 'admin@example.com',
          role: 'admin',
          first_name: 'Admin',
          last_name: 'User'
        }
      }
    ] : [],
    backupStrategy: {
      frequency: 'Daily automated backups',
      retention: '30 days',
      method: 'pg_dump for PostgreSQL',
      storage: 'Cloud storage (S3/GCS)'
    },
    securityConsiderations: [
      'All passwords stored as bcrypt hashes',
      'Sensitive data encrypted at rest',
      'Row-level security policies implemented',
      'Regular security audits',
      'Principle of least privilege for database users'
    ]
  };
}

function validateSchema(schema) {
  if (!schema || !schema.tables || schema.tables.length === 0) {
    throw new Error('Invalid schema structure');
  }
}

module.exports = { generate };

// Made with Bob
