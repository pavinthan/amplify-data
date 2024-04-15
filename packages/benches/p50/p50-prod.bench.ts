import { bench } from '@arktype/attest';
import { a, ClientSchema } from '@aws-amplify/data-schema';

/**
 * The following benchmarks are for testing production-level ~p50 schemas.
 * Our assumption around what is a prod-level "p50" is approximately 25 models
 * with 10 fields each, 80% of models contain connections, with a mix of auth
 * rules and identifiers.
 */
bench('prod p50', () => {
  a.schema({
    PrivacySetting: a.enum(['PRIVATE', 'FRIENDS_ONLY', 'PUBLIC']),
    FulfillmentStatus: a.enum(['PENDING', 'SHIPPED', 'DELIVERED']),
    Company: a
      .model({
        id: a.id().required(),
        name: a.string().required(),
        phone: a
          .phone()
          .required()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        website: a.url(),
        privateIdentifier: a
          .string()
          .required()
          .authorization([a.allow.owner()]),
        employees: a.hasMany('Employee', ['companyId']),
        stores: a.hasMany('Store', ['companyId']),
        warehouses: a.hasMany('Warehouse', ['companyId']),
        location: a.customType({
          lat: a.float().required(),
          long: a.float().required(),
        }),
      })
      .authorization([a.allow.private().to(['read']), a.allow.owner()]),
    // Model #2:
    Employee: a
      .model({
        employeeId: a.id().required(),
        name: a.string().required(),
        email: a.email().required().authorization([a.allow.owner()]),
        phone: a
          .phone()
          .required()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        website: a.url(),
        ssn: a.string().required().authorization([a.allow.owner()]),
        companyId: a.id(),
        company: a.belongsTo('Company', ['companyId']),
        todos: a.hasMany('Todo', ['employeeId']),
        posts: a.hasMany('Post', ['employeeId']),
        tasks: a.hasMany('Task', ['employeeId']),
      })
      .identifier(['employeeId', 'name'])
      .authorization([a.allow.private().to(['read']), a.allow.owner()]),
    // Model #3:
    Salary: a
      .model({
        wage: a.float(),
        currency: a.string(),
      })
      .authorization([a.allow.specificGroups(['Admin', 'Leadership'])]),
    // Model #4:
    Store: a.model({
      id: a.id().required(),
      name: a.string().required(),
      description: a.string(),
      storeImgSrc: a.url(),
      location: a.customType({
        lat: a.float().required(),
        long: a.float().required(),
      }),
      phone: a
        .phone()
        .required()
        .authorization([a.allow.private().to(['read']), a.allow.owner()]),
      privacySetting: a.ref('PrivacySetting').required(),
      companyId: a.id(),
      company: a.belongsTo('Company', ['companyId']),
      warehouse: a.belongsTo('Warehouse', ['storeId']),
    }),
    // Model #5:
    Warehouse: a.model({
      id: a.id().required(),
      name: a.string().required(),
      description: a.string(),
      warehouseImgSrc: a.url(),
      location: a.customType({
        lat: a.float().required(),
        long: a.float().required(),
      }),
      phone: a
        .phone()
        .required()
        .authorization([a.allow.private().to(['read']), a.allow.owner()]),
      privacySetting: a.ref('PrivacySetting'),
      companyId: a.id(),
      company: a.belongsTo('Company', ['companyId']),
      storeId: a.id(),
      stores: a.hasMany('Store', ['storeId']),
      textField1: a.string(),
    }),
    // Model #6:
    Customer: a
      .model({
        customerId: a.id().required(),
        name: a.string().required(),
        profileImgSrc: a.url(),
        privacySetting: a.ref('PrivacySetting').required(),
        phone: a
          .phone()
          .required()
          .authorization([
            a.allow.specificGroup('Admin').to(['read']),
            a.allow.owner(),
          ]),
        orders: a.hasMany('Order', ['customerId']),
        textField1: a.string(),
        textField2: a.string(),
        textField3: a.string(),
      })
      .identifier(['customerId', 'name']),
    // Model #7:
    Todo: a
      .model({
        todoId: a.id().required(),
        name: a.string().required(),
        privacySetting: a.enum(['PRIVATE', 'FRIENDS_ONLY', 'PUBLIC']),
        viewCount: a.integer(),
        complete: a.boolean(),
        employeeId: a.id(),
        employee: a.belongsTo('Employee', ['employeeId']),
        textField1: a.string(),
        textField2: a.string(),
        textField3: a.string(),
        textField4: a.string(),
      })
      .identifier(['todoId', 'name']),
    // Model #8:
    Post: a
      .model({
        name: a.string().default('My new Post'),
        notes: a.string().array(),
        location: a.customType({
          lat: a.float().required(),
          long: a.float().required(),
        }),
        lastViewedDate: a.date(),
        lastViewedTime: a.time(),
        privacySetting: a.ref('PrivacySetting').required(),
        employeeId: a.id(),
        employee: a.belongsTo('Employee', ['employeeId']),
        textField1: a.string(),
        textField2: a.string(),
        textField3: a.string(),
      })
      .authorization([a.allow.public().to(['read']), a.allow.owner()]),
    // Model #9:
    Task: a.model({
      name: a.string().required(),
      description: a.string(),
      privacySetting: a.ref('PrivacySetting').required(),
      priority: a.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      employeeId: a.id(),
      employee: a.belongsTo('Employee', ['employeeId']),
      textField1: a.string(),
      textField2: a.string(),
      textField3: a.string(),
      textField4: a.string(),
      textField5: a.string(),
    }),
    // Model #10:
    Order: a.model({
      id: a.id().required(),
      status: a.ref('FulfillmentStatus').required(),
      customerId: a.id(),
      customer: a.belongsTo('Customer', ['customerId']),
      totalPrice: a.float(),
      date: a.date(),
      lineItems: a.hasMany('LineItem', ['orderId']),
      textField1: a.string(),
      textField2: a.string(),
      textField3: a.string(),
      textField4: a.string(),
      textField5: a.string(),
      textField6: a.string(),
      textField7: a.string(),
      textField8: a.string(),
      textField9: a.string(),
      textField10: a.string(),
    }),
    // Model #11:
    LineItem: a.model({
      id: a.id().required(),
      product: a.hasOne('Product', ['lineItemId']),
      agreedUnitPrice: a.float(),
      quantity: a.integer().required(),
      fulfilledQuantity: a.integer(),
      fulfilledTime: a.time(),
      fulfilledDate: a.date(),
      orderId: a.id(),
      order: a.belongsTo('Order', ['orderId']),
      textField1: a.string(),
      textField2: a.string(),
    }),
    // Model #12:
    Product: a.model({
      id: a.id().required(),
      name: a.string().required(),
      description: a.string().required(),
      msrpUSD: a.float(),
      productImgSrc: a.url(),
      inventoryCount: a.integer(),
      lineItemId: a.id(),
      lineItem: a.belongsTo('LineItem', ['lineItemId']),
      reviews: a.hasMany('Review', ['productId']),
      textField1: a.string(),
      textField2: a.string(),
      textField3: a.string(),
      textField4: a.string(),
      textField5: a.string(),
      textField6: a.string(),
      textField7: a.string(),
      textField8: a.string(),
      textField9: a.string(),
      textField10: a.string(),
      textField11: a.string(),
      textField12: a.string(),
      textField13: a.string(),
      textField14: a.string(),
      textField15: a.string(),
    }),
    Review: a.model({
      content: a.string().required(),
      rating: a.integer().required(),
      productId: a.id(),
      product: a.belongsTo('Product', ['productId']),
    }),
    // Model #13:
    CustomerPost: a
      .model({
        title: a.string(),
        textField1: a.string(),
        textField2: a.string(),
        textField3: a.string(),
        textField4: a.string(),
        textField5: a.string(),
        textField6: a.string(),
        textField7: a.string(),
        textField8: a.string(),
        groups: a.string().array(),
      })
      .authorization([a.allow.groupDefinedIn('groups')]),
    /**
     * With the exception of the last 4 unconnected models, the following models
     * are duplicates of the above models, with different names.
     */
    // Model #14:
    Company2: a
      .model({
        id: a.id().required(),
        name: a.string().required(),
        phone: a
          .phone()
          .required()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        website: a.url(),
        privateIdentifier: a
          .string()
          .required()
          .authorization([a.allow.owner()]),
        employees: a.hasMany('Employee2', ['company2Id']),
        stores: a.hasMany('Store2', ['company2Id']),
        warehouses: a.hasMany('Warehouse2', ['company2Id']),
        location: a.customType({
          lat: a.float().required(),
          long: a.float().required(),
        }),
      })
      .authorization([a.allow.private().to(['read']), a.allow.owner()]),
    // Model #15:
    Employee2: a
      .model({
        employeeId: a.id().required(),
        name: a.string().required(),
        email: a.email().required().authorization([a.allow.owner()]),
        phone: a
          .phone()
          .required()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        website: a.url(),
        ssn: a.string().required().authorization([a.allow.owner()]),
        company2Id: a.id(),
        company: a.belongsTo('Company2', ['company2Id']),
        todos: a.hasMany('Todo2', ['employee2Id']),
        posts: a.hasMany('Post2', ['employee2Id']),
        tasks: a.hasMany('Task2', ['employee2Id']),
      })
      .identifier(['employeeId', 'name'])
      .authorization([a.allow.private().to(['read']), a.allow.owner()]),
    // Model #16:
    Salary2: a
      .model({
        wage: a.float(),
        currency: a.string(),
      })
      .authorization([a.allow.specificGroups(['Admin2', 'Leadership2'])]),
    // Model #17:
    Store2: a.model({
      id: a.id().required(),
      name: a.string().required(),
      description: a.string(),
      storeImgSrc: a.url(),
      location: a.customType({
        lat: a.float().required(),
        long: a.float().required(),
      }),
      phone: a
        .phone()
        .required()
        .authorization([a.allow.private().to(['read']), a.allow.owner()]),
      privacySetting: a.ref('PrivacySetting').required(),
      company2Id: a.id(),
      company: a.belongsTo('Company2', ['company2Id']),
      warehouse2Id: a.id(),
      warehouse: a.belongsTo('Warehouse2', ['warehouse2Id']),
    }),
    // Model #18:
    Warehouse2: a.model({
      id: a.id().required(),
      name: a.string().required(),
      description: a.string(),
      warehouseImgSrc: a.url(),
      location: a.customType({
        lat: a.float().required(),
        long: a.float().required(),
      }),
      phone: a
        .phone()
        .required()
        .authorization([a.allow.private().to(['read']), a.allow.owner()]),
      privacySetting: a.ref('PrivacySetting2'),
      company2Id: a.id(),
      company: a.belongsTo('Company2', ['company2Id']),
      stores: a.hasMany('Store2', ['store2Id']),
      textField1: a.string(),
    }),
    // Model #19:
    Customer2: a
      .model({
        customerId: a.id().required(),
        name: a.string().required(),
        profileImgSrc: a.url(),
        privacySetting: a.ref('PrivacySetting').required(),
        phone: a
          .phone()
          .required()
          .authorization([
            a.allow.specificGroup('Admin2').to(['read']),
            a.allow.owner(),
          ]),
        orders: a.hasMany('Order2', ['order2Id']),
        textField1: a.string(),
        textField2: a.string(),
        textField3: a.string(),
      })
      .identifier(['customerId', 'name']),
    // Model #20:
    Todo2: a
      .model({
        todoId: a.id().required(),
        name: a.string().required(),
        privacySetting: a.enum(['PRIVATE', 'FRIENDS_ONLY', 'PUBLIC']),
        viewCount: a.integer(),
        complete: a.boolean(),
        employee2Id: a.id(),
        employee: a.belongsTo('Employee2', 'employee2Id'),
        textField1: a.string(),
        textField2: a.string(),
        textField3: a.string(),
        textField4: a.string(),
      })
      .identifier(['todoId', 'name']),
    // Model #21:
    Post2: a
      .model({
        name: a.string().default('My new Post'),
        notes: a.string().array(),
        location: a.customType({
          lat: a.float().required(),
          long: a.float().required(),
        }),
        lastViewedDate: a.date(),
        lastViewedTime: a.time(),
        privacySetting: a.ref('PrivacySetting').required(),
        employee2Id: a.id(),
        employee: a.belongsTo('Employee2', 'employee2Id'),
        textField1: a.string(),
        textField2: a.string(),
        textField3: a.string(),
      })
      .authorization([a.allow.public().to(['read']), a.allow.owner()]),
    // Model #22:
    Model22: a
      .model({
        id: a.id().required(),
        description: a.string().required(),
        url: a.url().required(),
        integer: a.integer().required(),
        float: a.float().required(),
        boolean: a.boolean().required(),
        date: a
          .date()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        time: a
          .time()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        dateTime: a
          .datetime()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        timestamp: a.timestamp(),
        json: a.json(),
        ipAddress: a.ipAddress(),
      })
      .authorization([a.allow.private('iam').to(['read']), a.allow.owner()]),
    // Model #23:
    Model23: a
      .model({
        id: a.id().required(),
        description: a.string().required(),
        url: a.url().required(),
        integer: a.integer().required(),
        float: a.float().required(),
        boolean: a.boolean().required(),
        date: a
          .date()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        time: a
          .time()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        dateTime: a
          .datetime()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        timestamp: a.timestamp(),
        json: a.json(),
        ipAddress: a.ipAddress(),
      })
      .authorization([a.allow.private('iam').to(['read']), a.allow.owner()]),
    // Model #24:
    Model24: a
      .model({
        id: a.id().required(),
        description: a.string().required(),
        url: a.url().required(),
        integer: a.integer().required(),
        float: a.float().required(),
        boolean: a.boolean().required(),
        date: a
          .date()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        time: a
          .time()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        dateTime: a
          .datetime()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        timestamp: a.timestamp(),
        json: a.json(),
        ipAddress: a.ipAddress(),
      })
      .authorization([a.allow.private('iam').to(['read']), a.allow.owner()]),
    // Model #25:
    Model25: a
      .model({
        id: a.id().required(),
        description: a.string().required(),
        url: a.url().required(),
        integer: a.integer().required(),
        float: a.float().required(),
        boolean: a.boolean().required(),
        date: a
          .date()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        time: a
          .time()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        dateTime: a
          .datetime()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        timestamp: a.timestamp(),
        json: a.json(),
        ipAddress: a.ipAddress(),
      })
      .authorization([a.allow.private('iam').to(['read']), a.allow.owner()]),
    // [Global authorization rule]
  }).authorization([a.allow.public()]);
}).types([95110, 'instantiations']);

bench('prod p50 w/ client types', () => {
  const s = a
    .schema({
      PrivacySetting: a.enum(['PRIVATE', 'FRIENDS_ONLY', 'PUBLIC']),
      FulfillmentStatus: a.enum(['PENDING', 'SHIPPED', 'DELIVERED']),
      Company: a
        .model({
          id: a.id().required(),
          name: a.string().required(),
          phone: a
            .phone()
            .required()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          website: a.url(),
          privateIdentifier: a
            .string()
            .required()
            .authorization([a.allow.owner()]),
          employees: a.hasMany('Employee', 'companyId'),
          stores: a.hasMany('Store', 'companyId'),
          warehouses: a.hasMany('Warehouse', 'companyId'),
          location: a.customType({
            lat: a.float().required(),
            long: a.float().required(),
          }),
        })
        .authorization([a.allow.private().to(['read']), a.allow.owner()]),
      // Model #2:
      Employee: a
        .model({
          employeeId: a.id().required(),
          name: a.string().required(),
          email: a.email().required().authorization([a.allow.owner()]),
          phone: a
            .phone()
            .required()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          website: a.url(),
          ssn: a.string().required().authorization([a.allow.owner()]),
          companyId: a.id(),
          company: a.belongsTo('Company', 'companyId'),
          todos: a.hasMany('Todo', 'employeeId'),
          posts: a.hasMany('Post', 'employeeId'),
          tasks: a.hasMany('Task', 'employeeId'),
        })
        .identifier(['employeeId', 'name'])
        .authorization([a.allow.private().to(['read']), a.allow.owner()]),
      // Model #3:
      Salary: a
        .model({
          wage: a.float(),
          currency: a.string(),
        })
        .authorization([a.allow.specificGroups(['Admin', 'Leadership'])]),
      // Model #4:
      Store: a.model({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        storeImgSrc: a.url(),
        location: a.customType({
          lat: a.float().required(),
          long: a.float().required(),
        }),
        phone: a
          .phone()
          .required()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        privacySetting: a.ref('PrivacySetting').required(),
        companyId: a.id(),
        company: a.belongsTo('Company', 'companyId'),
        warehouseId: a.id(),
        warehouse: a.belongsTo('Warehouse', 'warehouseId'),
      }),
      // Model #5:
      Warehouse: a.model({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        warehouseImgSrc: a.url(),
        location: a.customType({
          lat: a.float().required(),
          long: a.float().required(),
        }),
        phone: a
          .phone()
          .required()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        privacySetting: a.ref('PrivacySetting'),
        companyId: a.id(),
        company: a.belongsTo('Company', 'companyId'),
        stores: a.hasMany('Store', 'warehouseId'),
        textField1: a.string(),
      }),
      // Model #6:
      Customer: a
        .model({
          customerId: a.id().required(),
          name: a.string().required(),
          profileImgSrc: a.url(),
          privacySetting: a.ref('PrivacySetting').required(),
          phone: a
            .phone()
            .required()
            .authorization([
              a.allow.specificGroup('Admin').to(['read']),
              a.allow.owner(),
            ]),
          orders: a.hasMany('Order', 'customId'),
          textField1: a.string(),
          textField2: a.string(),
          textField3: a.string(),
        })
        .identifier(['customerId', 'name']),
      // Model #7:
      Todo: a
        .model({
          todoId: a.id().required(),
          name: a.string().required(),
          privacySetting: a.enum(['PRIVATE', 'FRIENDS_ONLY', 'PUBLIC']),
          viewCount: a.integer(),
          complete: a.boolean(),
          employeeId: a.id(),
          employee: a.belongsTo('Employee', 'employeeId'),
          textField1: a.string(),
          textField2: a.string(),
          textField3: a.string(),
          textField4: a.string(),
        })
        .identifier(['todoId', 'name']),
      // Model #8:
      Post: a
        .model({
          name: a.string().default('My new Post'),
          notes: a.string().array(),
          location: a.customType({
            lat: a.float().required(),
            long: a.float().required(),
          }),
          lastViewedDate: a.date(),
          lastViewedTime: a.time(),
          privacySetting: a.ref('PrivacySetting').required(),
          employeeId: a.id(),
          employee: a.belongsTo('Employee', 'employeeId'),
          textField1: a.string(),
          textField2: a.string(),
          textField3: a.string(),
        })
        .authorization([a.allow.public().to(['read']), a.allow.owner()]),
      // Model #9:
      Task: a.model({
        name: a.string().required(),
        description: a.string(),
        privacySetting: a.ref('PrivacySetting').required(),
        priority: a.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        employeeId: a.id(),
        employee: a.belongsTo('Employee', 'employeeId'),
        textField1: a.string(),
        textField2: a.string(),
        textField3: a.string(),
        textField4: a.string(),
        textField5: a.string(),
      }),
      // Model #10:
      Order: a.model({
        id: a.id().required(),
        status: a.ref('FulfillmentStatus').required(),
        customerId: a.id(),
        customer: a.belongsTo('Customer', 'customerId'),
        items: a.hasMany('OrderItem', 'orderId'),
        totalPrice: a.float(),
        date: a.date(),
        lineItems: a.hasMany('LineItem', 'orderId'),
        textField1: a.string(),
        textField2: a.string(),
        textField3: a.string(),
        textField4: a.string(),
        textField5: a.string(),
        textField6: a.string(),
        textField7: a.string(),
        textField8: a.string(),
        textField9: a.string(),
        textField10: a.string(),
      }),
      // Model #11:
      LineItem: a.model({
        id: a.id().required(),
        product: a.hasOne('Product', 'lineItemId'),
        agreedUnitPrice: a.float(),
        quantity: a.integer().required(),
        fulfilledQuantity: a.integer(),
        fulfilledTime: a.time(),
        fulfilledDate: a.date(),
        orderId: a.id(),
        order: a.belongsTo('Order', 'orderId'),
        textField1: a.string(),
        textField2: a.string(),
      }),
      // Model #12:
      Product: a.model({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string().required(),
        msrpUSD: a.float(),
        productImgSrc: a.url(),
        inventoryCount: a.integer(),
        lineItemId: a.id(),
        lineItem: a.belongsTo('LineItem', 'lineItemId'),
        reviews: a.hasMany('Review', 'productId'),
        textField1: a.string(),
        textField2: a.string(),
        textField3: a.string(),
        textField4: a.string(),
        textField5: a.string(),
        textField6: a.string(),
        textField7: a.string(),
        textField8: a.string(),
        textField9: a.string(),
        textField10: a.string(),
        textField11: a.string(),
        textField12: a.string(),
        textField13: a.string(),
        textField14: a.string(),
        textField15: a.string(),
      }),
      // Model #13:
      CustomerPost: a
        .model({
          title: a.string(),
          textField1: a.string(),
          textField2: a.string(),
          textField3: a.string(),
          textField4: a.string(),
          textField5: a.string(),
          textField6: a.string(),
          textField7: a.string(),
          textField8: a.string(),
          groups: a.string().array(),
        })
        .authorization([a.allow.groupDefinedIn('groups')]),
      /**
       * With the exception of the last 4 unconnected models, the following models
       * are duplicates of the above models, with different names.
       */
      // Model #14:
      Company2: a
        .model({
          id: a.id().required(),
          name: a.string().required(),
          phone: a
            .phone()
            .required()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          website: a.url(),
          privateIdentifier: a
            .string()
            .required()
            .authorization([a.allow.owner()]),
          employees: a.hasMany('Employee2', 'company2Id'),
          stores: a.hasMany('Store2', 'company2Id'),
          warehouses: a.hasMany('Warehouse2', 'company2Id'),
          location: a.customType({
            lat: a.float().required(),
            long: a.float().required(),
          }),
        })
        .authorization([a.allow.private().to(['read']), a.allow.owner()]),
      // Model #15:
      Employee2: a
        .model({
          employeeId: a.id().required(),
          name: a.string().required(),
          email: a.email().required().authorization([a.allow.owner()]),
          phone: a
            .phone()
            .required()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          website: a.url(),
          ssn: a.string().required().authorization([a.allow.owner()]),
          company2Id: a.id(),
          company: a.belongsTo('Company2', 'company2Id'),
          todos: a.hasMany('Todo2', 'employee2Id'),
          posts: a.hasMany('Post2', 'employee2Id'),
          tasks: a.hasMany('Task2', 'employee2Id'),
        })
        .identifier(['employeeId', 'name'])
        .authorization([a.allow.private().to(['read']), a.allow.owner()]),
      // Model #16:
      Salary2: a
        .model({
          wage: a.float(),
          currency: a.string(),
        })
        .authorization([a.allow.specificGroups(['Admin2', 'Leadership2'])]),
      // Model #17:
      Store2: a.model({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        storeImgSrc: a.url(),
        location: a.customType({
          lat: a.float().required(),
          long: a.float().required(),
        }),
        phone: a
          .phone()
          .required()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        privacySetting: a.ref('PrivacySetting').required(),
        company2Id: a.id(),
        company: a.belongsTo('Company2', 'company2Id'),
        // hasMany w/out `belongsTo`:
        customers: a.hasMany('Customer2', 'store2Id'),
        warehouse2Id: a.id(),
        warehouse: a.belongsTo('Warehouse2', 'warehouse2Id'),
      }),
      // Model #18:
      Warehouse2: a.model({
        id: a.id().required(),
        name: a.string().required(),
        description: a.string(),
        warehouseImgSrc: a.url(),
        location: a.customType({
          lat: a.float().required(),
          long: a.float().required(),
        }),
        phone: a
          .phone()
          .required()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        privacySetting: a.ref('PrivacySetting2'),
        company2Id: a.id(),
        company: a.belongsTo('Company2', 'company2Id'),
        stores: a.hasMany('Store2', 'warehouse2Id'),
        textField1: a.string(),
      }),
      // Model #19:
      Customer2: a
        .model({
          customerId: a.id().required(),
          name: a.string().required(),
          profileImgSrc: a.url(),
          privacySetting: a.ref('PrivacySetting').required(),
          phone: a
            .phone()
            .required()
            .authorization([
              a.allow.specificGroup('Admin2').to(['read']),
              a.allow.owner(),
            ]),
          orders: a.hasMany('Order2', 'customer2Id'),
          textField1: a.string(),
          textField2: a.string(),
          textField3: a.string(),
        })
        .identifier(['customerId', 'name']),
      // Model #20:
      Todo2: a
        .model({
          todoId: a.id().required(),
          name: a.string().required(),
          privacySetting: a.enum(['PRIVATE', 'FRIENDS_ONLY', 'PUBLIC']),
          viewCount: a.integer(),
          complete: a.boolean(),
          employee2Id: a.id(),
          employee: a.belongsTo('Employee2', 'employee2Id'),
          textField1: a.string(),
          textField2: a.string(),
          textField3: a.string(),
          textField4: a.string(),
        })
        .identifier(['todoId', 'name']),
      // Model #21:
      Post2: a
        .model({
          name: a.string().default('My new Post'),
          notes: a.string().array(),
          location: a.customType({
            lat: a.float().required(),
            long: a.float().required(),
          }),
          lastViewedDate: a.date(),
          lastViewedTime: a.time(),
          privacySetting: a.ref('PrivacySetting').required(),
          employee2Id: a.id(),
          employee: a.belongsTo('Employee2', 'employee2Id'),
          textField1: a.string(),
          textField2: a.string(),
          textField3: a.string(),
        })
        .authorization([a.allow.public().to(['read']), a.allow.owner()]),
      // Model #22:
      Model22: a
        .model({
          id: a.id().required(),
          description: a.string().required(),
          url: a.url().required(),
          integer: a.integer().required(),
          float: a.float().required(),
          boolean: a.boolean().required(),
          date: a
            .date()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          time: a
            .time()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          dateTime: a
            .datetime()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          timestamp: a.timestamp(),
          json: a.json(),
          ipAddress: a.ipAddress(),
        })
        .authorization([a.allow.private('iam').to(['read']), a.allow.owner()]),
      // Model #23:
      Model23: a
        .model({
          id: a.id().required(),
          description: a.string().required(),
          url: a.url().required(),
          integer: a.integer().required(),
          float: a.float().required(),
          boolean: a.boolean().required(),
          date: a
            .date()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          time: a
            .time()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          dateTime: a
            .datetime()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          timestamp: a.timestamp(),
          json: a.json(),
          ipAddress: a.ipAddress(),
        })
        .authorization([a.allow.private('iam').to(['read']), a.allow.owner()]),
      // Model #24:
      Model24: a
        .model({
          id: a.id().required(),
          description: a.string().required(),
          url: a.url().required(),
          integer: a.integer().required(),
          float: a.float().required(),
          boolean: a.boolean().required(),
          date: a
            .date()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          time: a
            .time()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          dateTime: a
            .datetime()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          timestamp: a.timestamp(),
          json: a.json(),
          ipAddress: a.ipAddress(),
        })
        .authorization([a.allow.private('iam').to(['read']), a.allow.owner()]),
      // Model #25:
      Model25: a
        .model({
          id: a.id().required(),
          description: a.string().required(),
          url: a.url().required(),
          integer: a.integer().required(),
          float: a.float().required(),
          boolean: a.boolean().required(),
          date: a
            .date()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          time: a
            .time()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          dateTime: a
            .datetime()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          timestamp: a.timestamp(),
          json: a.json(),
          ipAddress: a.ipAddress(),
        })
        .authorization([a.allow.private('iam').to(['read']), a.allow.owner()]),
      // [Global authorization rule]
    })
    .authorization([a.allow.public()]);

  type _ = ClientSchema<typeof s>;
}).types([702019, 'instantiations']);

bench('prod p50 combined w/ client types', () => {
  const s1 = a.schema({
    PrivacySetting: a.enum(['PRIVATE', 'FRIENDS_ONLY', 'PUBLIC']),
    FulfillmentStatus: a.enum(['PENDING', 'SHIPPED', 'DELIVERED']),
    Company: a
      .model({
        id: a.id().required(),
        name: a.string().required(),
        phone: a
          .phone()
          .required()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        website: a.url(),
        privateIdentifier: a
          .string()
          .required()
          .authorization([a.allow.owner()]),
        employees: a.hasMany('Employee', 'companyId'),
        stores: a.hasMany('Store', 'companyId'),
        warehouses: a.hasMany('Warehouse', 'companyId'),
        location: a.customType({
          lat: a.float().required(),
          long: a.float().required(),
        }),
      })
      .authorization([a.allow.private().to(['read']), a.allow.owner()]),
    // Model #2:
    Employee: a
      .model({
        employeeId: a.id().required(),
        name: a.string().required(),
        email: a.email().required().authorization([a.allow.owner()]),
        phone: a
          .phone()
          .required()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        website: a.url(),
        ssn: a.string().required().authorization([a.allow.owner()]),
        companyId: a.id(),
        company: a.belongsTo('Company', 'companyId'),
        todos: a.hasMany('Todo', 'employeeId'),
        posts: a.hasMany('Post', 'employeeId'),
        tasks: a.hasMany('Task', 'employeeId'),
      })
      .identifier(['employeeId', 'name'])
      .authorization([a.allow.private().to(['read']), a.allow.owner()]),
    // Model #3:
    Salary: a
      .model({
        wage: a.float(),
        currency: a.string(),
      })
      .authorization([a.allow.specificGroups(['Admin', 'Leadership'])]),
    // Model #4:
    Store: a.model({
      id: a.id().required(),
      name: a.string().required(),
      description: a.string(),
      storeImgSrc: a.url(),
      location: a.customType({
        lat: a.float().required(),
        long: a.float().required(),
      }),
      phone: a
        .phone()
        .required()
        .authorization([a.allow.private().to(['read']), a.allow.owner()]),
      privacySetting: a.ref('PrivacySetting').required(),
      companyId: a.id(),
      company: a.belongsTo('Company', 'companyId'),
      warehouseId: a.id(),
      warehouse: a.belongsTo('Warehouse', 'warehouseId'),
    }),
    // Model #5:
    Warehouse: a.model({
      id: a.id().required(),
      name: a.string().required(),
      description: a.string(),
      warehouseImgSrc: a.url(),
      location: a.customType({
        lat: a.float().required(),
        long: a.float().required(),
      }),
      phone: a
        .phone()
        .required()
        .authorization([a.allow.private().to(['read']), a.allow.owner()]),
      privacySetting: a.ref('PrivacySetting'),
      companyId: a.id(),
      company: a.belongsTo('Company', 'companyId'),
      stores: a.hasMany('Store', 'warehouseId'),
      textField1: a.string(),
    }),
    // Model #6:
    Customer: a
      .model({
        customerId: a.id().required(),
        name: a.string().required(),
        profileImgSrc: a.url(),
        privacySetting: a.ref('PrivacySetting').required(),
        phone: a
          .phone()
          .required()
          .authorization([
            a.allow.specificGroup('Admin').to(['read']),
            a.allow.owner(),
          ]),
        orders: a.hasMany('Order', 'customerId'),
        textField1: a.string(),
        textField2: a.string(),
        textField3: a.string(),
      })
      .identifier(['customerId', 'name']),
    // Model #7:
    Todo: a
      .model({
        todoId: a.id().required(),
        name: a.string().required(),
        privacySetting: a.enum(['PRIVATE', 'FRIENDS_ONLY', 'PUBLIC']),
        viewCount: a.integer(),
        complete: a.boolean(),
        employeeId: a.id(),
        employee: a.belongsTo('Employee', 'employeeId'),
        textField1: a.string(),
        textField2: a.string(),
        textField3: a.string(),
        textField4: a.string(),
      })
      .identifier(['todoId', 'name']),
    // Model #8:
    Post: a
      .model({
        name: a.string().default('My new Post'),
        notes: a.string().array(),
        location: a.customType({
          lat: a.float().required(),
          long: a.float().required(),
        }),
        lastViewedDate: a.date(),
        lastViewedTime: a.time(),
        privacySetting: a.ref('PrivacySetting').required(),
        employeeId: a.id(),
        employee: a.belongsTo('Employee', 'employeeId'),
        textField1: a.string(),
        textField2: a.string(),
        textField3: a.string(),
      })
      .authorization([a.allow.public().to(['read']), a.allow.owner()]),
    // Model #9:
    Task: a.model({
      name: a.string().required(),
      description: a.string(),
      privacySetting: a.ref('PrivacySetting').required(),
      priority: a.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      employeeId: a.id(),
      employee: a.belongsTo('Employee', 'employeeId'),
      textField1: a.string(),
      textField2: a.string(),
      textField3: a.string(),
      textField4: a.string(),
      textField5: a.string(),
    }),
    // Model #10:
    Order: a.model({
      id: a.id().required(),
      status: a.ref('FulfillmentStatus').required(),
      customerId: a.id(),
      customer: a.belongsTo('Customer', 'customerId'),
      items: a.hasMany('OrderItem', 'orderId'),
      totalPrice: a.float(),
      date: a.date(),
      lineItems: a.hasMany('LineItem', 'orderId'),
      textField1: a.string(),
      textField2: a.string(),
      textField3: a.string(),
      textField4: a.string(),
      textField5: a.string(),
      textField6: a.string(),
      textField7: a.string(),
      textField8: a.string(),
      textField9: a.string(),
      textField10: a.string(),
    }),
    // Model #11:
    LineItem: a.model({
      id: a.id().required(),
      product: a.hasOne('Product', 'lineItemId'),
      agreedUnitPrice: a.float(),
      quantity: a.integer().required(),
      fulfilledQuantity: a.integer(),
      fulfilledTime: a.time(),
      fulfilledDate: a.date(),
      orderId: a.id(),
      order: a.belongsTo('Order', 'orderId'),
      textField1: a.string(),
      textField2: a.string(),
    }),
    // Model #12:
    Product: a.model({
      id: a.id().required(),
      name: a.string().required(),
      description: a.string().required(),
      msrpUSD: a.float(),
      productImgSrc: a.url(),
      inventoryCount: a.integer(),
      lineItemId: a.id(),
      lineItem: a.belongsTo('LineItem', 'lineItemId'),
      reviews: a.hasMany('Review', 'productId'),
      textField1: a.string(),
      textField2: a.string(),
      textField3: a.string(),
      textField4: a.string(),
      textField5: a.string(),
      textField6: a.string(),
      textField7: a.string(),
      textField8: a.string(),
      textField9: a.string(),
      textField10: a.string(),
      textField11: a.string(),
      textField12: a.string(),
      textField13: a.string(),
      textField14: a.string(),
      textField15: a.string(),
    }),
    // Model #13:
    CustomerPost: a
      .model({
        title: a.string(),
        textField1: a.string(),
        textField2: a.string(),
        textField3: a.string(),
        textField4: a.string(),
        textField5: a.string(),
        textField6: a.string(),
        textField7: a.string(),
        textField8: a.string(),
        groups: a.string().array(),
      })
      .authorization([a.allow.groupDefinedIn('groups')]),
    /**
     * With the exception of the last 4 unconnected models, the following models
     * are duplicates of the above models, with different names.
     */
    // Model #14:
    Company2: a
      .model({
        id: a.id().required(),
        name: a.string().required(),
        phone: a
          .phone()
          .required()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        website: a.url(),
        privateIdentifier: a
          .string()
          .required()
          .authorization([a.allow.owner()]),
        employees: a.hasMany('Employee2', 'company2Id'),
        stores: a.hasMany('Store2', 'company2Id'),
        warehouses: a.hasMany('Warehouse2', 'company2Id'),
        location: a.customType({
          lat: a.float().required(),
          long: a.float().required(),
        }),
      })
      .authorization([a.allow.private().to(['read']), a.allow.owner()]),
    // Model #15:
    Employee2: a
      .model({
        employeeId: a.id().required(),
        name: a.string().required(),
        email: a.email().required().authorization([a.allow.owner()]),
        phone: a
          .phone()
          .required()
          .authorization([a.allow.private().to(['read']), a.allow.owner()]),
        website: a.url(),
        ssn: a.string().required().authorization([a.allow.owner()]),
        company2Id: a.id(),
        company: a.belongsTo('Company2', 'company2Id'),
        todos: a.hasMany('Todo2', 'employee2Id'),
        posts: a.hasMany('Post2', 'employee2Id'),
        tasks: a.hasMany('Task2', 'employee2Id'),
      })
      .identifier(['employeeId', 'name'])
      .authorization([a.allow.private().to(['read']), a.allow.owner()]),
    // Model #16:
    Salary2: a
      .model({
        wage: a.float(),
        currency: a.string(),
      })
      .authorization([a.allow.specificGroups(['Admin2', 'Leadership2'])]),
    // Model #17:
    Store2: a.model({
      id: a.id().required(),
      name: a.string().required(),
      description: a.string(),
      storeImgSrc: a.url(),
      location: a.customType({
        lat: a.float().required(),
        long: a.float().required(),
      }),
      phone: a
        .phone()
        .required()
        .authorization([a.allow.private().to(['read']), a.allow.owner()]),
      privacySetting: a.ref('PrivacySetting').required(),
      company2Id: a.id(),
      company: a.belongsTo('Company2', 'company2Id'),
      warehouse2Id: a.id(),
      warehouse: a.belongsTo('Warehouse2', 'warehouse2Id'),
    }),
    // Model #18:
    Warehouse2: a.model({
      id: a.id().required(),
      name: a.string().required(),
      description: a.string(),
      warehouseImgSrc: a.url(),
      location: a.customType({
        lat: a.float().required(),
        long: a.float().required(),
      }),
      phone: a
        .phone()
        .required()
        .authorization([a.allow.private().to(['read']), a.allow.owner()]),
      privacySetting: a.ref('PrivacySetting2'),
      companyId: a.id(),
      company: a.belongsTo('Company2', 'company2Id'),
      stores: a.hasMany('Store2', 'warehouse2Id'),
      textField1: a.string(),
    }),
    // Model #19:
    Customer2: a
      .model({
        customerId: a.id().required(),
        name: a.string().required(),
        profileImgSrc: a.url(),
        privacySetting: a.ref('PrivacySetting').required(),
        phone: a
          .phone()
          .required()
          .authorization([
            a.allow.specificGroup('Admin2').to(['read']),
            a.allow.owner(),
          ]),
        orders: a.hasMany('Order2', 'customer2Id'),
        textField1: a.string(),
        textField2: a.string(),
        textField3: a.string(),
      })
      .identifier(['customerId', 'name']),
  });
  const s2 = a
    .schema({
      // Model #20:
      Todo2: a
        .model({
          todoId: a.id().required(),
          name: a.string().required(),
          privacySetting: a.enum(['PRIVATE', 'FRIENDS_ONLY', 'PUBLIC']),
          viewCount: a.integer(),
          complete: a.boolean(),
          employee2Id: a.id(),
          employee: a.belongsTo('Employee2', 'employee2Id'),
          textField1: a.string(),
          textField2: a.string(),
          textField3: a.string(),
          textField4: a.string(),
        })
        .identifier(['todoId', 'name']),
      // Model #21:
      Post2: a
        .model({
          name: a.string().default('My new Post'),
          notes: a.string().array(),
          location: a.customType({
            lat: a.float().required(),
            long: a.float().required(),
          }),
          lastViewedDate: a.date(),
          lastViewedTime: a.time(),
          privacySetting: a.ref('PrivacySetting').required(),
          employee2Id: a.id(),
          employee: a.belongsTo('Employee2', 'employee2Id'),
          textField1: a.string(),
          textField2: a.string(),
          textField3: a.string(),
        })
        .authorization([a.allow.public().to(['read']), a.allow.owner()]),
      // Model #22:
      Model22: a
        .model({
          id: a.id().required(),
          description: a.string().required(),
          url: a.url().required(),
          integer: a.integer().required(),
          float: a.float().required(),
          boolean: a.boolean().required(),
          date: a
            .date()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          time: a
            .time()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          dateTime: a
            .datetime()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          timestamp: a.timestamp(),
          json: a.json(),
          ipAddress: a.ipAddress(),
        })
        .authorization([a.allow.private('iam').to(['read']), a.allow.owner()]),
      // Model #23:
      Model23: a
        .model({
          id: a.id().required(),
          description: a.string().required(),
          url: a.url().required(),
          integer: a.integer().required(),
          float: a.float().required(),
          boolean: a.boolean().required(),
          date: a
            .date()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          time: a
            .time()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          dateTime: a
            .datetime()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          timestamp: a.timestamp(),
          json: a.json(),
          ipAddress: a.ipAddress(),
        })
        .authorization([a.allow.private('iam').to(['read']), a.allow.owner()]),
      // Model #24:
      Model24: a
        .model({
          id: a.id().required(),
          description: a.string().required(),
          url: a.url().required(),
          integer: a.integer().required(),
          float: a.float().required(),
          boolean: a.boolean().required(),
          date: a
            .date()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          time: a
            .time()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          dateTime: a
            .datetime()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          timestamp: a.timestamp(),
          json: a.json(),
          ipAddress: a.ipAddress(),
        })
        .authorization([a.allow.private('iam').to(['read']), a.allow.owner()]),
      // Model #25:
      Model25: a
        .model({
          id: a.id().required(),
          description: a.string().required(),
          url: a.url().required(),
          integer: a.integer().required(),
          float: a.float().required(),
          boolean: a.boolean().required(),
          date: a
            .date()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          time: a
            .time()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          dateTime: a
            .datetime()
            .authorization([a.allow.private().to(['read']), a.allow.owner()]),
          timestamp: a.timestamp(),
          json: a.json(),
          ipAddress: a.ipAddress(),
        })
        .authorization([a.allow.private('iam').to(['read']), a.allow.owner()]),
      // [Global authorization rule]
    })
    .authorization([a.allow.public()]);

  const s = a.combine([s1, s2]);
  type _ = ClientSchema<typeof s>;
}).types([1577055, 'instantiations']);
