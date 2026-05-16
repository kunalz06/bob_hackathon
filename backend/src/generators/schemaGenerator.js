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
  const titleLower = input.title.toLowerCase();

  // Always include Users table if auth is needed
  if (hasAuth) {
    tables.push({
      name: 'users',
      description: 'User accounts and authentication',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
        { name: 'email', type: 'VARCHAR(255)', unique: true, nullable: false },
        { name: 'password_hash', type: 'VARCHAR(255)', nullable: false },
        { name: 'first_name', type: 'VARCHAR(100)', nullable: true },
        { name: 'last_name', type: 'VARCHAR(100)', nullable: true },
        { name: 'role', type: 'VARCHAR(50)', default: "'user'", nullable: false },
        { name: 'is_active', type: 'BOOLEAN', default: '1', nullable: false },
        { name: 'email_verified', type: 'BOOLEAN', default: '0', nullable: false },
        { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP', nullable: false },
        { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP', nullable: false }
      ],
      indexes: [
        { name: 'idx_users_email', columns: ['email'], unique: true },
        { name: 'idx_users_role', columns: ['role'] }
      ]
    });
  }

  // Generate domain-specific tables based on the idea
  const domainTables = generateDomainTables(input.title, input.features, hasAuth);
  tables.push(...domainTables);

  // Ensure we have between 4-8 tables total
  const currentCount = tables.length;
  if (currentCount < 4) {
    // Add generic tables to reach minimum
    const genericTables = generateGenericTables(4 - currentCount, hasAuth);
    tables.push(...genericTables);
  } else if (currentCount > 8) {
    // Trim to 8 tables (keep users + most important domain tables)
    tables.splice(8);
  }

  const relationships = buildRelationships(tables, hasAuth);

  return {
    database: 'SQLite',
    version: '3',
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
      method: 'SQLite file backup',
      storage: 'Local or cloud storage'
    },
    securityConsiderations: [
      'All passwords stored as bcrypt hashes',
      'Database file permissions properly set',
      'Input validation prevents SQL injection',
      'Regular security audits',
      'Principle of least privilege for database access'
    ]
  };
}

function generateDomainTables(title, features, hasAuth) {
  const tables = [];
  const titleLower = title.toLowerCase();
  
  // Attendance system
  if (titleLower.includes('attendance')) {
    tables.push({
      name: 'classes',
      description: 'Classes or courses',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
        { name: 'name', type: 'VARCHAR(255)', nullable: false },
        { name: 'code', type: 'VARCHAR(50)', unique: true, nullable: false },
        { name: 'description', type: 'TEXT', nullable: true },
        { name: 'teacher_id', type: 'INTEGER', nullable: false, foreignKey: 'users(id)' },
        { name: 'schedule', type: 'TEXT', nullable: true },
        { name: 'is_active', type: 'BOOLEAN', default: '1', nullable: false },
        { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP', nullable: false },
        { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP', nullable: false }
      ],
      indexes: [
        { name: 'idx_classes_code', columns: ['code'], unique: true },
        { name: 'idx_classes_teacher', columns: ['teacher_id'] }
      ]
    });

    tables.push({
      name: 'students',
      description: 'Student information',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
        { name: 'user_id', type: 'INTEGER', nullable: false, foreignKey: 'users(id)' },
        { name: 'roll_number', type: 'VARCHAR(50)', unique: true, nullable: false },
        { name: 'department', type: 'VARCHAR(100)', nullable: true },
        { name: 'year', type: 'INTEGER', nullable: true },
        { name: 'section', type: 'VARCHAR(10)', nullable: true },
        { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP', nullable: false },
        { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP', nullable: false }
      ],
      indexes: [
        { name: 'idx_students_roll', columns: ['roll_number'], unique: true },
        { name: 'idx_students_user', columns: ['user_id'] }
      ]
    });

    tables.push({
      name: 'class_enrollments',
      description: 'Student enrollments in classes',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
        { name: 'class_id', type: 'INTEGER', nullable: false, foreignKey: 'classes(id)' },
        { name: 'student_id', type: 'INTEGER', nullable: false, foreignKey: 'students(id)' },
        { name: 'enrolled_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP', nullable: false },
        { name: 'status', type: 'VARCHAR(50)', default: "'active'", nullable: false }
      ],
      indexes: [
        { name: 'idx_enrollments_class', columns: ['class_id'] },
        { name: 'idx_enrollments_student', columns: ['student_id'] },
        { name: 'idx_enrollments_unique', columns: ['class_id', 'student_id'], unique: true }
      ]
    });

    tables.push({
      name: 'attendance_records',
      description: 'Daily attendance records',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
        { name: 'class_id', type: 'INTEGER', nullable: false, foreignKey: 'classes(id)' },
        { name: 'student_id', type: 'INTEGER', nullable: false, foreignKey: 'students(id)' },
        { name: 'date', type: 'DATE', nullable: false },
        { name: 'status', type: 'VARCHAR(20)', nullable: false },
        { name: 'marked_by', type: 'INTEGER', nullable: false, foreignKey: 'users(id)' },
        { name: 'remarks', type: 'TEXT', nullable: true },
        { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP', nullable: false }
      ],
      indexes: [
        { name: 'idx_attendance_class_date', columns: ['class_id', 'date'] },
        { name: 'idx_attendance_student', columns: ['student_id'] },
        { name: 'idx_attendance_unique', columns: ['class_id', 'student_id', 'date'], unique: true }
      ]
    });

    tables.push({
      name: 'attendance_reports',
      description: 'Generated attendance reports',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
        { name: 'class_id', type: 'INTEGER', nullable: false, foreignKey: 'classes(id)' },
        { name: 'report_type', type: 'VARCHAR(50)', nullable: false },
        { name: 'start_date', type: 'DATE', nullable: false },
        { name: 'end_date', type: 'DATE', nullable: false },
        { name: 'generated_by', type: 'INTEGER', nullable: false, foreignKey: 'users(id)' },
        { name: 'file_path', type: 'VARCHAR(500)', nullable: true },
        { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP', nullable: false }
      ],
      indexes: [
        { name: 'idx_reports_class', columns: ['class_id'] },
        { name: 'idx_reports_dates', columns: ['start_date', 'end_date'] }
      ]
    });
  } else {
    // Generic feature-based tables
    features.slice(0, 5).forEach((feature, index) => {
      const tableName = feature.name.toLowerCase().replace(/\s+/g, '_');
      tables.push({
        name: tableName,
        description: `Data for ${feature.name}`,
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
          { name: 'name', type: 'VARCHAR(255)', nullable: false },
          { name: 'description', type: 'TEXT', nullable: true },
          { name: 'status', type: 'VARCHAR(50)', default: "'active'", nullable: false },
          ...(hasAuth ? [{ name: 'user_id', type: 'INTEGER', nullable: false, foreignKey: 'users(id)' }] : []),
          { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP', nullable: false },
          { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP', nullable: false }
        ],
        indexes: [
          { name: `idx_${tableName}_status`, columns: ['status'] },
          ...(hasAuth ? [{ name: `idx_${tableName}_user`, columns: ['user_id'] }] : [])
        ]
      });
    });
  }
  
  return tables;
}

function generateGenericTables(count, hasAuth) {
  const tables = [];
  const genericNames = ['items', 'records', 'entries', 'documents', 'resources'];
  
  for (let i = 0; i < count && i < genericNames.length; i++) {
    tables.push({
      name: genericNames[i],
      description: `Generic ${genericNames[i]} table`,
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
        { name: 'name', type: 'VARCHAR(255)', nullable: false },
        { name: 'description', type: 'TEXT', nullable: true },
        { name: 'status', type: 'VARCHAR(50)', default: "'active'", nullable: false },
        ...(hasAuth ? [{ name: 'user_id', type: 'INTEGER', nullable: false, foreignKey: 'users(id)' }] : []),
        { name: 'created_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP', nullable: false },
        { name: 'updated_at', type: 'DATETIME', default: 'CURRENT_TIMESTAMP', nullable: false }
      ],
      indexes: [
        { name: `idx_${genericNames[i]}_status`, columns: ['status'] },
        ...(hasAuth ? [{ name: `idx_${genericNames[i]}_user`, columns: ['user_id'] }] : [])
      ]
    });
  }
  
  return tables;
}

function buildRelationships(tables, hasAuth) {
  const relationships = [];
  
  tables.forEach(table => {
    table.columns.forEach(column => {
      if (column.foreignKey) {
        const [refTable, refColumn] = column.foreignKey.split('(');
        relationships.push({
          from: table.name,
          to: refTable,
          type: 'many-to-one',
          foreignKey: column.name,
          onDelete: column.name.includes('user') ? 'CASCADE' : 'CASCADE',
          onUpdate: 'CASCADE'
        });
      }
    });
  });
  
  return relationships;
}

function validateSchema(schema) {
  if (!schema || !schema.tables || schema.tables.length === 0) {
    throw new Error('Invalid schema structure');
  }
}

module.exports = { generate };

// Made with Bob
