export class routes {
  private static Url = '';

  public static get baseUrl(): string {
    return this.Url;
  }

  //ui-interface routes

  //auth routes
  public static get signin(): string {
    return this.baseUrl + '/signin';
  }
  public static get signup(): string {
    return this.baseUrl + '/signup';
  }

  public static get resetPassword(): string {
    return this.baseUrl + '/reset-password';
  }
  public static get forgotPassword(): string {
    return this.baseUrl + '/forgot-password';
  }
  public static get success(): string {
    return this.baseUrl + '/success';
  }
  public static get success2(): string {
    return this.baseUrl + '/success-2';
  }
  public static get success3(): string {
    return this.baseUrl + '/success-3';
  }

  // page routes

  public static get index(): string {
    return this.baseUrl + '/dashboard/index';
  }

  public static get superAdmin(): string {
    return this.baseUrl + '/super-admin';
  }
  public static get superAdminPurchaseTransaction(): string {
    return this.superAdmin + '/purchase-transaction';
  }
  public static get RTL(): string {
    return this.baseUrl + '/layout-rtl';
  }
  public static get chat(): string {
    return this.baseUrl + '/application/chats';
  }
  public static get calendar(): string {
    return this.baseUrl + '/application/calendar';
  }
  public static get email(): string {
    return this.baseUrl + '/application/email';
  }
  public static get todo(): string {
    return this.baseUrl + '/application/todo';
  }
  public static get notes(): string {
    return this.baseUrl + '/application/notes';
  }
  public static get kanban(): string {
    return this.baseUrl + '/application/kanban-view';
  }
  public static get filemanager(): string {
    return this.baseUrl + '/application/file-manager';
  }
  public static get employeeList(): string {
    return this.baseUrl + '/employees/employee-list';
  }
  public static get employeeGrid(): string {
    return this.baseUrl + '/employees/employee-grid';
  }
  public static get employeeDetails(): string {
    return this.baseUrl + '/employees/employee-details';
  }
  public static get holidays(): string {
    return this.baseUrl + '/holidays';
  }
  public static get leaveadmin(): string {
    return this.baseUrl + '/attendance/leaves/leave-admin';
  }
  public static get attendanceemployee(): string {
    return this.baseUrl + '/attendance/attendance-employee';
  }
  public static get clientList(): string {
    return this.baseUrl + '/client/client-list';
  }

  public static get tasks(): string {
    return this.baseUrl + '/projects/tasks';
  }
  public static get sales(): string {
    return this.baseUrl + '/sales';
  }
  public static get invoice(): string {
    return this.sales + '/invoices';
  }
  public static get invoiceDetails(): string {
    return this.sales + '/invoice-details';
  }
  public static get expenses(): string {
    return this.sales + '/expenses';
  }

  public static get candidateslist(): string {
    return this.baseUrl + '/candidates/candidates-list';
  }
  public static get candidatesGrid(): string {
    return this.baseUrl + '/candidates/candidates-grid';
  }
  public static get knowledgebase(): string {
    return this.baseUrl + '/support/knowledgebase';
  }

  public static get activities(): string {
    return this.baseUrl + '/crm/activity';
  }
  public static get banks(): string {
    return this.baseUrl + '/banks';
  }

  public static get laboratories(): string {
    return this.baseUrl + '/laboratories';
  }
  public static get pharmaceuticalForms(): string {
    return this.baseUrl + '/pharmaceutical-forms';
  }
  public static get unitsCatalog(): string {
    return this.baseUrl + '/units';
  }
  public static get users(): string {
    return this.baseUrl + '/user-management/users';
  }
  public static get rolesPermissions(): string {
    return this.baseUrl + '/user-management/roles-permissions';
  }
  public static get courierCompanies(): string {
    return this.baseUrl + '/courier-companies';
  }
  public static get couriers(): string {
    return this.baseUrl + '/couriers';
  }
  public static get returnUnits(): string {
    return this.baseUrl + '/return-units';
  }
  public static get projects(): string {
    return this.baseUrl + '/projects';
  }
  public static get supplies(): string {
    return this.baseUrl + '/supplies';
  }

  public static get loginpro(): string {
    return this.baseUrl + '/login';
  }
  public static get login2(): string {
    return this.baseUrl + '/login-2';
  }
  public static get login3(): string {
    return this.baseUrl + '/login-3';
  }
  public static get registers(): string {
    return this.baseUrl + '/register';
  }
  public static get registers2(): string {
    return this.baseUrl + '/register-2';
  }
  public static get registers3(): string {
    return this.baseUrl + '/register-3';
  }
  public static get forgotpassword2(): string {
    return this.baseUrl + '/forgot-password-2';
  }
  public static get forgotpassword3(): string {
    return this.baseUrl + '/forgot-password-3';
  }
  public static get emailverification(): string {
    return this.baseUrl + '/email-verification';
  }
  public static get emailverification3(): string {
    return this.baseUrl + '/email-verification-3';
  }
  public static get emailverification2(): string {
    return this.baseUrl + '/email-verification-2';
  }
  public static get resetpassword(): string {
    return this.baseUrl + '/reset-password';
  }
  public static get resetpassword2(): string {
    return this.baseUrl + '/reset-password-2';
  }
  public static get resetpassword3(): string {
    return this.baseUrl + '/reset-password-3';
  }
  public static get twostepverification(): string {
    return this.baseUrl + '/two-step-verification';
  }
  public static get twostepverification3(): string {
    return this.baseUrl + '/two-step-verification-3';
  }
  public static get twostepverification2(): string {
    return this.baseUrl + '/two-step-verification-2';
  }
  public static get locations(): string {
    return this.baseUrl + '/locations';
  }
  public static get countries(): string {
    return this.locations + '/countries';
  }

  public static get projectList(): string {
    return this.baseUrl + '/projects/project-list';
  }
  public static get projectDetails(): string {
    return this.baseUrl + '/projects/project-details';
  }
  public static get jobList(): string {
    return this.baseUrl + '/jobs/jobs-list';
  }

  public static get crm(): string {
    return this.baseUrl + '/crm';
  }
  public static get pipeline(): string {
    return this.crm + '/pipeline';
  }
  public static get dealsDetails(): string {
    return this.crm + '/deals/deals-details';
  }
  public static get contactList(): string {
    return this.crm + '/contact/contacts-list';
  }
  public static get companiesGrid(): string {
    return this.crm + '/company/companies-grid';
  }
  public static get companyDetails(): string {
    return this.crm + '/company/company-details';
  }
  public static get leadsGrid(): string {
    return this.crm + '/leads/leads-grid';
  }
  public static get dealsGrid(): string {
    return this.crm + '/deals/deals-grid';
  }
  public static get leadsDetails(): string {
    return this.crm + '/leads/leads-details';
  }

  public static get generalSettings(): string {
    return this.baseUrl + '/settings/general-settings';
  }
  public static get websiteSettings(): string {
    return this.baseUrl + '/settings/website-settings';
  }
  public static get profileSettings(): string {
    return this.generalSettings + '/profile-settings';
  }
  public static get securitySettings(): string {
    return this.generalSettings + '/security-settings';
  }
  public static get bussinessSettings(): string {
    return this.websiteSettings + '/bussiness-settings';
  }
  public static get profile(): string {
    return this.baseUrl + '/profile';
  }
}
