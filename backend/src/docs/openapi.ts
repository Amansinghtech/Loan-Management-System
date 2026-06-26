import { env } from '../config/env';

/**
 * Hand-authored OpenAPI 3.0 document for the LMS API. Kept centralized (rather
 * than scattered JSDoc) so the contract is easy to read end-to-end. Served as
 * interactive docs at /api/docs and as raw JSON at /api/docs.json.
 */
export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'LendFlow LMS API',
    version: '1.0.0',
    description:
      'Loan Management System REST API. Authentication uses a JWT stored in an ' +
      'httpOnly cookie (`lms_token`) issued on login/signup, so most endpoints ' +
      'require an authenticated session. Role-based access control gates the ' +
      'executive and admin operations.',
  },
  servers: [
    { url: '/api', description: 'Current host' },
    { url: `http://localhost:${env.port}/api`, description: 'Local development' },
  ],
  tags: [
    { name: 'Health', description: 'Service liveness' },
    { name: 'Auth', description: 'Signup, login, session' },
    { name: 'Borrower', description: 'Borrower profile & eligibility' },
    { name: 'Uploads', description: 'Salary slip storage (Cloudflare R2)' },
    { name: 'Loans', description: 'Loan application & lifecycle transitions' },
    { name: 'Operations', description: 'Executive/admin dashboards' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'lms_token',
        description: 'JWT set automatically as an httpOnly cookie on login/signup.',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Invalid email or password.' },
          errors: {
            type: 'object',
            nullable: true,
            description: 'Optional structured details (validation/BRE failures).',
          },
        },
      },
      Role: {
        type: 'string',
        enum: ['ADMIN', 'SALES', 'SANCTION', 'DISBURSEMENT', 'COLLECTION', 'BORROWER'],
      },
      LoanStatus: {
        type: 'string',
        enum: ['APPLIED', 'SANCTIONED', 'REJECTED', 'DISBURSED', 'CLOSED'],
      },
      EmploymentMode: {
        type: 'string',
        enum: ['SALARIED', 'SELF_EMPLOYED', 'UNEMPLOYED'],
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { $ref: '#/components/schemas/Role' },
          fullName: { type: 'string' },
          pan: { type: 'string', example: 'ABCDE1234F' },
          dob: { type: 'string', format: 'date-time' },
          monthlySalary: { type: 'number' },
          employmentMode: { $ref: '#/components/schemas/EmploymentMode' },
          profileComplete: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      SalarySlip: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          bucket: { type: 'string' },
          mimeType: { type: 'string', example: 'application/pdf' },
          originalName: { type: 'string', example: 'march-slip.pdf' },
        },
      },
      Loan: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          applicationNo: { type: 'string', example: 'LF-3K9F2A1' },
          borrower: {
            oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/User' }],
          },
          amount: { type: 'number', example: 150000 },
          tenureDays: { type: 'integer', example: 90 },
          interestRate: { type: 'number', example: 12 },
          simpleInterest: { type: 'number' },
          totalRepayment: { type: 'number' },
          amountPaid: { type: 'number' },
          status: { $ref: '#/components/schemas/LoanStatus' },
          salarySlip: { $ref: '#/components/schemas/SalarySlip' },
          rejectionReason: { type: 'string' },
          appliedAt: { type: 'string', format: 'date-time' },
          sanctionedAt: { type: 'string', format: 'date-time' },
          rejectedAt: { type: 'string', format: 'date-time' },
          disbursedAt: { type: 'string', format: 'date-time' },
          closedAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          loan: { type: 'string' },
          borrower: { type: 'string' },
          utrNumber: { type: 'string', example: 'UTR123456' },
          amount: { type: 'number' },
          date: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Lead: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          profileComplete: { type: 'boolean' },
          employmentMode: { $ref: '#/components/schemas/EmploymentMode' },
          monthlySalary: { type: 'number', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Stats: {
        type: 'object',
        properties: {
          borrowers: { type: 'integer', example: 11 },
          loans: { type: 'integer', example: 14 },
          byStatus: {
            type: 'object',
            properties: {
              APPLIED: { type: 'integer' },
              SANCTIONED: { type: 'integer' },
              REJECTED: { type: 'integer' },
              DISBURSED: { type: 'integer' },
              CLOSED: { type: 'integer' },
            },
          },
          disbursedAmount: { type: 'number', example: 1250000 },
          collected: { type: 'number', example: 480000 },
          outstanding: { type: 'number', example: 620000 },
        },
      },
      SignupRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 80, example: 'Asha Mehta' },
          email: { type: 'string', format: 'email', example: 'asha@example.com' },
          password: { type: 'string', minLength: 8, maxLength: 72, example: 'Password@123' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@lendflow.com' },
          password: { type: 'string', example: 'Password@123' },
        },
      },
      ProfileRequest: {
        type: 'object',
        required: ['fullName', 'pan', 'dob', 'monthlySalary', 'employmentMode'],
        properties: {
          fullName: { type: 'string', minLength: 2, maxLength: 120 },
          pan: { type: 'string', example: 'ABCDE1234F', description: 'Format: 5 letters, 4 digits, 1 letter' },
          dob: { type: 'string', format: 'date', example: '1995-06-15' },
          monthlySalary: { type: 'number', minimum: 0, example: 60000 },
          employmentMode: { $ref: '#/components/schemas/EmploymentMode' },
        },
      },
      ApplyLoanRequest: {
        type: 'object',
        required: ['amount', 'tenureDays', 'salarySlip'],
        properties: {
          amount: { type: 'number', minimum: 50000, maximum: 500000, example: 150000 },
          tenureDays: { type: 'integer', minimum: 30, maximum: 365, example: 90 },
          salarySlip: { $ref: '#/components/schemas/SalarySlip' },
        },
      },
      SanctionRequest: {
        type: 'object',
        required: ['decision'],
        properties: {
          decision: { type: 'string', enum: ['APPROVE', 'REJECT'] },
          reason: {
            type: 'string',
            maxLength: 500,
            description: 'Required when decision is REJECT.',
          },
        },
      },
      PaymentRequest: {
        type: 'object',
        required: ['utrNumber', 'amount'],
        properties: {
          utrNumber: { type: 'string', minLength: 6, maxLength: 40, example: 'UTR123456' },
          amount: { type: 'number', exclusiveMinimum: 0, example: 25000 },
          date: { type: 'string', format: 'date', description: 'Defaults to now if omitted.' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Missing or invalid authentication',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Forbidden: {
        description: 'Authenticated but the role is not permitted',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      NotFound: {
        description: 'Resource not found',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      ValidationError: {
        description: 'Request validation failed',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Conflict: {
        description: 'State conflict (duplicate, invalid transition, etc.)',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
  },
  security: [{ cookieAuth: [] }],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Liveness check',
        security: [],
        responses: {
          200: {
            description: 'Service is up',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new borrower account',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/SignupRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Account created; auth cookie set',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in and receive the auth cookie',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Logged in; auth cookie set',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Clear the auth cookie',
        security: [],
        responses: {
          200: {
            description: 'Logged out',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { message: { type: 'string', example: 'Logged out' } },
                },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the current authenticated user',
        responses: {
          200: {
            description: 'Current user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/borrower/profile': {
      put: {
        tags: ['Borrower'],
        summary: 'Create or update the borrower profile (runs the BRE)',
        description:
          'Upserts the borrower KYC/eligibility fields. The Business Rule Engine ' +
          'validates age, salary, PAN and employment; failures return 400 with a ' +
          'structured `errors` payload.',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ProfileRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Profile saved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/uploads/salary-slip': {
      post: {
        tags: ['Uploads'],
        summary: 'Upload a salary slip (multipart) to R2',
        description: 'Borrower-only. Max 5 MB. Returns the stored object reference.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' },
                },
                required: ['file'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'File stored',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { salarySlip: { $ref: '#/components/schemas/SalarySlip' } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/uploads/view': {
      get: {
        tags: ['Uploads'],
        summary: 'Get a short-lived presigned URL for a stored slip',
        parameters: [
          {
            name: 'key',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'The stored object key (borrowers may only view their own).',
          },
        ],
        responses: {
          200: {
            description: 'Presigned URL',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { url: { type: 'string', format: 'uri' } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/loans': {
      post: {
        tags: ['Loans'],
        summary: 'Apply for a loan (borrower)',
        description: 'Interest math is computed server-side. Profile must be complete.',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ApplyLoanRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Loan created (status APPLIED)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { loan: { $ref: '#/components/schemas/Loan' } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/loans/mine': {
      get: {
        tags: ['Loans'],
        summary: "List the current borrower's loans",
        responses: {
          200: {
            description: 'Loans',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    loans: { type: 'array', items: { $ref: '#/components/schemas/Loan' } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/loans/{id}': {
      get: {
        tags: ['Loans'],
        summary: 'Get a single loan by id',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Loan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { loan: { $ref: '#/components/schemas/Loan' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/loans/{id}/payments': {
      get: {
        tags: ['Loans'],
        summary: 'List payments recorded against a loan',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Payments',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    payments: { type: 'array', items: { $ref: '#/components/schemas/Payment' } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      post: {
        tags: ['Loans'],
        summary: 'Record a repayment (Collection)',
        description:
          'UTR is unique across all payments. Amount must be > 0 and <= outstanding. ' +
          'The loan auto-closes when fully repaid.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/PaymentRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Payment recorded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    payment: { $ref: '#/components/schemas/Payment' },
                    loan: { $ref: '#/components/schemas/Loan' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/loans/{id}/sanction': {
      patch: {
        tags: ['Loans'],
        summary: 'Approve or reject an APPLIED loan (Sanction)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/SanctionRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Updated loan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { loan: { $ref: '#/components/schemas/Loan' } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/loans/{id}/disburse': {
      patch: {
        tags: ['Loans'],
        summary: 'Mark a SANCTIONED loan as DISBURSED (Disbursement)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Updated loan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { loan: { $ref: '#/components/schemas/Loan' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/ops/sales/leads': {
      get: {
        tags: ['Operations'],
        summary: 'List pre-application borrower leads (Sales)',
        responses: {
          200: {
            description: 'Leads',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    leads: { type: 'array', items: { $ref: '#/components/schemas/Lead' } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/ops/stats': {
      get: {
        tags: ['Operations'],
        summary: 'Admin KPI summary (admin only)',
        responses: {
          200: {
            description: 'Portfolio KPIs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { stats: { $ref: '#/components/schemas/Stats' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/ops/loans': {
      get: {
        tags: ['Operations'],
        summary: 'List loans filtered by status (executive/admin)',
        parameters: [
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'One or more statuses, comma-separated (e.g. `DISBURSED,CLOSED`).',
          },
        ],
        responses: {
          200: {
            description: 'Loans (borrower populated)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    loans: { type: 'array', items: { $ref: '#/components/schemas/Loan' } },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/ops/payments': {
      get: {
        tags: ['Operations'],
        summary: 'Global repayment ledger (Collection/Admin)',
        responses: {
          200: {
            description: 'All payments with loan/borrower/recorder populated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    payments: { type: 'array', items: { $ref: '#/components/schemas/Payment' } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
  },
} as const;
