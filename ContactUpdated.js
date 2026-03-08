//If the namespace object isn�t defined, create it.
if (typeof (Ecolab) === "undefined") {
    Ecolab = {};
}

Ecolab.Contact = {
    FormOnLoad: function (executionContext) {
        Ecolab.Common.formContext = executionContext.getFormContext();

        Ecolab.Contact.Validate();
    },

    OnLoad: function () {
        "use strict";
        try {
            Ecolab.Contact.SetupForm();
            Ecolab.Contact.InitFormData();
            Ecolab.Contact.ConfigFields();
            Ecolab.Contact.CreateForm();

            Ecolab.Contact.Retrieve.Account();

            //const siteAccount = Ecolab.Contact.Retrieve.SiteAccount();
            //const promise2 = 42;
            //const promise3 = new Promise((resolve, reject) => {
            //    setTimeout(resolve, 100, "foo");
            //});

            //Promise.all([siteAccount, promise2, promise3]).then((values) => {
            //    Ecolab.Common.formContext.ui.refreshRibbon();
            //});


            Ecolab.Contact.FilterLookup.Account();

            Ecolab.Contact.Helpers.SetEntityTypeOnParentCustomer();
        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.OnLoad: " + error.message || error.description);
        }

    },

    Validate: function () {
        "use strict";
        try {
            var account = Ecolab.Common.GetFieldValue("parentcustomerid");

            //close the form if new Contact is not being created from Account.
            if (account && Ecolab.Common.formContext.ui.getFormType() === Ecolab.Common.FormType.Create) {
                Xrm.Navigation.openAlertDialog({
                    text: Ecolab.Common.GetResourceString("contact.0009")
                }).then(
                    function success(result) {
                        Ecolab.Common.formContext.ui.close();
                    });
                return;
            }
            else {
                Ecolab.Contact.OnLoad();
            }
        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.Validate: " + error.message || error.description);
        }
    },

    SetupForm: function () {
        "use strict";
        try {
            Ecolab.Common.hideFieldsMobile = [];
            Ecolab.Common.disableFieldsMobile = [];
            Ecolab.Common.optionalFieldsMobile = [];
            Ecolab.Common.hideSectionsMobile = [];
            Ecolab.Common.hideTabsMobile = [];


            Ecolab.Common.fieldOnChange =
                [
                    { schemaName: "parentcustomerid", handler: Ecolab.Contact.FieldOnChange.Account },
                    { schemaName: "ecl_countryid", handler: Ecolab.Contact.FieldOnChange.Country },
                    { schemaName: "mobilephone", handler: Ecolab.Contact.FieldOnChange.MobilePhone }
                ];
            Ecolab.Common.filterLookup =
                [
                    { schemaName: "ecl_primaryownerid", handler: Ecolab.Contact.FilterLookup.PrimaryOwner },
                    { schemaName: "parentcustomerid", handler: Ecolab.Contact.FilterLookup.Account }
                ];

            Ecolab.Common.SetupForm();

        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.SetupForm: " + error.message || error.description);
        }

    },

    InitFormData: function () {
        "use strict";
        try {
            Ecolab.Contact.formType = Ecolab.Common.formContext.ui.getFormType();
            if (Ecolab.Contact.formType !== Ecolab.Common.FormType.Create)
                Ecolab.Contact.recordId = Ecolab.Common.formContext.data.entity.getId().replace("{", '').replace("}", '');

            Ecolab.Contact.CDMStatus = {
                Active: 806460005,
                Sent: 806460001
            };

            Ecolab.Contact.account = Ecolab.Common.GetFieldValue("parentcustomerid");
            Ecolab.Contact.status = Ecolab.Common.GetFieldValue("statecode");
            Ecolab.Contact.globalBusiness = Ecolab.Common.GetFieldValue("ecl_globalbusiness");
            Ecolab.Contact.cdmUserContact = Ecolab.Common.GetFieldValue("ecl_cdmusercontactid");
            Ecolab.Contact.mobilePhone = Ecolab.Common.GetFieldValue("mobilephone");
            Ecolab.Contact.emailAddress = Ecolab.Common.GetFieldValue("emailaddress1");
            Ecolab.Contact.cdmUserContact = Ecolab.Common.GetFieldValue("ecl_cdmusercontactid");
        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.InitFormData: " + error.message || error.description);
        }
    },

    ConfigFields: function () {
        try {
            Ecolab.Contact.Retrieve.Account();

            if (Ecolab.Contact.cdmUserContact)
                Ecolab.Common.EnableDisable(["emailaddress1"], true);

            if (Ecolab.Contact.formType !== Ecolab.Common.FormType.Create)
                Ecolab.Common.EnableDisable(["parentcustomerid"], true);



        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.ConfigFields: " + error.message || error.description);
        }
    },

    ConfigFieldsAccess: function () {
        "use strict";
        try {
            if (Ecolab.Common.LoggedInUser.isLinkedInRollout) {
                Ecolab.Common.ShowFields(["linkedin"], true);
            } else {
                Ecolab.Common.ShowFields(["linkedin"], false);
            }

        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.ConfigFieldsAccess: " + error.message || error.description);
        }
    },

    CreateForm: function () {
        "use strict";
        try {
            Ecolab.Contact.Create.Account();
        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.CreateForm: " + error.message || error.description);
        }
    }
}



Ecolab.Contact.Retrieve = {
    //Invoked By: Ecolab.Contact.Create.SetOwner
    Account: function (onChange) {
        "use strict";
        return new Promise(function (resolve) {
            if (Ecolab.Contact.account) {
                Ecolab.Common.GetEntityDataUsingWebAPIAsync("account", Ecolab.Contact.account[0].id, "ecl_globalbusiness,customertypecode,_ecl_countryid_value,_ecl_stateprovinceid_value,_ecl_primaryownerid_value,_ownerid_value,ecl_isplant", "owningteam($select=teamid,name),owninguser($select=systemuserid,fullname)").then(
                    function (result) {
                        Ecolab.Contact.Retrieve.account = result;
                        Ecolab.Contact.Retrieve.Actions.Account(onChange);
                        resolve();
                    },
                    function (error) {
                        Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.Retrieve.Account: " + error.message || error.description);
                    });
            }
            else {
                Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.Retrieve.Account: Account does not contain data");
            }
        });
    },

    SiteAccount: function () {
        return new Promise(function (resolve) {
            try {
                if (Ecolab.Contact.recordId && Ecolab.Contact.Retrieve.account) {
                    var getSiteEnabledOnboarding = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true'>" +
                        "<entity name='account'>" +
                        "<attribute name='accountid'/>" +
                        "<attribute name='ecl_globalregionid'/>" +
                        "<order attribute='name' descending='false'/>" +
                        "<filter type='and'>" +
                        "<condition attribute='customertypecode' operator='eq' value='1'/>" +
                        "<condition attribute='accountid' operator='eq' value='" + Ecolab.Contact.Retrieve.account[0].id + "'/>" +
                        "</filter>" +
                        "<link-entity name='ecl_sinccode' from='ecl_sinccodeid' to='ecl_sincid' visible='false' link-type='outer' alias='a_61cb35c8e7bae51180de6c3be5a8c804'>" +
                        "<attribute name='ecl_description'/>" +
                        "</link-entity>" +
                        "<link-entity name='ecl_account_account' from='accountidone' to='accountid' visible='false' intersect='true'>" +
                        "<link-entity name='account' from='accountid' to='accountidtwo' alias='aw'>" +
                        "<filter type='and'>" +
                        "<condition attribute='ecl_enabledforonboarding' operator='eq' value='1'/>" +
                        "<condition attribute='customertypecode' operator='eq' value='4'/>" +
                        "</filter>" +
                        "</link-entity>" +
                        "</link-entity>" +
                        "<link-entity name='contact' from='parentcustomerid' to='accountid' link-type='inner' alias='ax'>" +
                        "<filter type='and'>" +
                        "<condition attribute='contactid' operator='eq' value='" + Ecolab.Contact.recordId + "'/>" +
                        "</filter>" +
                        "</link-entity>" +
                        "</entity>" +
                        "</fetch>";
                    Ecolab.Common.ExecuteFetchQuery("account", getSiteEnabledOnboarding).then(
                        function success(result) {
                            Ecolab.Contact.isAccountOnboardingEnabled = result && result.entities.length > 0;
                            resolve();
                        },
                        function (error) {
                            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.Retrieve.SiteAccount.ExecuteFetchQuery: " + error.message || error.description);
                        });
                }
            }
            catch (error) {
                Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.Retrieve.SiteAccount: " + error.message || error.description);
            }
        });
    },

    CDMUserContact: function () {
        "use strict";
        return new Promise(function (resolve) {
            try {
                if (Ecolab.Contact.cdmUserContact) {
                    Ecolab.Common.GetEntityDataUsingWebAPIAsync("ecl_cdmuser", Ecolab.Contact.cdmUserContact[0].id, "ecl_cdmstatus").then(
                        function (result) {
                            Ecolab.Contact.showGrantButton = result ?? [Ecolab.Contact.CDMStatus.Sent, Ecolab.Contact.CDMStatus.Active].includes(result.ecl_cdmstatus);
                            resolve();
                        },
                        function (error) {
                            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.Retrieve.CDMUserContact.GetEntityDataUsingWebAPIAsync: " + error.message || error.description);
                        });
                }
            }
            catch (error) {
                Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.Retrieve.CDMUserContact: " + error.message || error.description);
            }
        });

    },

    EmailDomain: function (emailDomain) {
        "use strict";
        return new Promise(function (resolve) {
            try {
                var FetchXml = "<fetch>" +
                    "<entity name='ecl_emaildomain' >" +
                    "<attribute name='ecl_name' />" +
                    "<attribute name='ecl_blacklist' />" +
                    "<filter type='and' >" +
                    "<condition attribute='ecl_blacklist' operator='eq' value=false />" +
                    "</filter>" +
                    "<link-entity name='ecl_ecl_emaildomain_account' from='ecl_emaildomainid' to='ecl_emaildomainid' intersect='true' >" +
                    "<all-attributes/>" +
                    "<filter type='and' >" +
                    "<condition attribute='accountid' operator='eq' value='" + Ecolab.Contact.Retrieve.account[0].id + "' />" +
                    "</filter>" +
                    "</link-entity>" +
                    "</entity>" +
                    "</fetch>";
                Ecolab.Common.ExecuteFetchQuery("ecl_emaildomain", "?fetchXml=" + FetchXml).then(
                    function success(result) {
                        if (result && emailDomain) {
                            if (result.entities.length > 0) {
                                for (var i = 0; i < result.entities.length; i++) {
                                    if (result.entities[i]["ecl_name"] !== null) {
                                        var emailDomainAddress = result.entities[i]["ecl_name"].toLowerCase();
                                        if (emailDomainAddress.charAt(emailDomainAddress.length - 1) === '.') {
                                            if (emailDomain.substring(0, emailDomain.indexOf(".") + 1) === emailDomainAddress) {
                                                Ecolab.Contact.isEmailDomainExist = true;
                                                return;
                                            }
                                        } else if (emailDomain === emailDomainAddress) {
                                            Ecolab.Contact.isEmailDomainExist = true
                                            return;
                                        }
                                    }
                                }
                                Ecolab.Contact.isEmailDomainExist = false;
                            } else {
                                Ecolab.Contact.IsEmailDomainExist = false;
                            }
                        }
                        else {
                            Ecolab.Contact.isEmailDomainExist = false;
                        }
                        resolve();
                    },
                    function (error) {
                        Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.Retrieve.EmailDomain.ExecuteFetchQuery: " + error.message || error.description);
                    });
            }
            catch (error) {
                Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.Retrieve.EmailDomain: " + error.message || error.description);
            }
        });
    },

    CDMUserAccount: function () {
        "use strict";
        return new Promise(function (resolve) {
            try {
                if (Ecolab.Contact.cdmUserContact && Ecolab.Contact.account) {
                    Ecolab.Common.GetMultipleRecordsUsingWebAPIAsync("ecl_cdmuseraccount", "?$filter=_ecl_cdmuserid_value eq '" + Ecolab.Contact.cdmUserContact[0].id.replace('{', '').replace('}', '') +
                        "' and  _ecl_accountid_value eq '" + Ecolab.Contact.account[0].id.replace('{', '').replace('}', '') + "'").then(
                            function success(results) {
                                if (results && results.entities && results.entities.length > 0) {
                                    Ecolab.Contact.isCdmUserAccount = true;
                                } else {
                                    Ecolab.Contact.isCdmUserAccount = false;
                                }
                                resolve();
                            },
                            function (error) {
                                Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.Retrieve.CDMUserAccount.GetMultipleRecordsUsingWebAPIAsync: " + error.message || error.description);
                            });
                }
                else {
                    Ecolab.Contact.isCdmUserAccount = false;
                }
            }
            catch (error) {
                Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.Retrieve.CDMUserAccount: " + error.message || error.description);
            }
        });
    }
};

Ecolab.Contact.Retrieve.Actions = {
    Account: function (onChange) {
        "use strict";
        try {
            if (Ecolab.Contact.Retrieve.account.customertypecode === Ecolab.Common.AccountType.Organization && Ecolab.Contact.Retrieve.account.ecl_globalbusiness === Ecolab.Common.GlobalBusiness.LifeSciences &&
                (Ecolab.Common.LoggedInUser.isCAM || Ecolab.Common.LoggedInUser.isOpsAdmin))
                Ecolab.Common.ShowFields(["ecl_executivesponsor", "ecl_executivebusinessreviewdate", "ecl_nextexecutivebusinessreviewdate"], true);
            else
                Ecolab.Common.ShowFields(["ecl_executivesponsor", "ecl_executivebusinessreviewdate", "ecl_nextexecutivebusinessreviewdate"], false);


            switch (Ecolab.Contact.Retrieve.account.ecl_globalbusiness) {
                case Ecolab.Common.GlobalBusiness.NalcoWater:
                    Ecolab.Common.ShowFields(["ecl_language"], true);
                    Ecolab.Common.ShowFields(["ecl_changenotification"], false);
                    Ecolab.Common.SetRequired(["ecl_language", "ecl_socialtype"], "none");
                    break;
                case Ecolab.Common.GlobalBusiness.EnergyServices:
                    Ecolab.Common.ShowFields(["ecl_language"], true);
                    Ecolab.Common.ShowFields(["ecl_changenotification"], false);
                    Ecolab.Common.SetRequired(["ecl_language", "ecl_socialtype"], "required");
                    break;
                case Ecolab.Common.GlobalBusiness.TextileCare:
                    Ecolab.Common.ShowFields(["ecl_changenotification"], false);
                    break;
                case Ecolab.Common.GlobalBusiness.FoodBeverage:
                    Ecolab.Common.ShowFields(["ecl_changenotification"], false);
                    break;
                case Ecolab.Common.GlobalBusiness.LifeSciences:
                    Ecolab.Common.ShowFields(["ecl_changenotification"], true);
                    break;
                default:
                    Ecolab.Common.ShowFields(["ecl_language"], false);
                    Ecolab.Common.SetRequired(["ecl_language", "ecl_socialtype"], "none");

            }

            Ecolab.Contact.Create.Account(onChange);

            Ecolab.Contact.FilterLookup.PrimaryOwner();
        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.Retrieve.Actions.Account: " + error.message || error.description);
        }

    }

}

Ecolab.Contact.FieldOnChange = {
    Account: function (onChange) {
        "use strict";
        try {
            if (onChange) {
                Ecolab.Common.formContext = onChange.getFormContext();
                Ecolab.Contact.Retrieve.account = Ecolab.Common.GetFieldValue("parentcustomerid");
                Ecolab.Contact.Retrieve.Account();
            }

        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.FieldOnChange.Account: " + error.message || error.description);
        }
    },

    Country: function () {
        "use strict";
        try {
            if (onChange) {
                Ecolab.Common.formContext = onChange.getFormContext();
                Ecolab.Contact.country = Ecolab.Common.GetFieldValue("ecl_countryid");
                if (!Ecolab.Contact.country) {
                    Ecolab.Common.SetDefaultValue(["ecl_stateprovinceid", "address1_postalcode", "address1_stateorprovince"]);
                }
            }
        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.FieldOnChange.Country: " + error.message || error.description);
        }
    },

    StateProvince: function () {
        "use strict";
        try {
            if (onChange) {
                Ecolab.Common.formContext = onChange.getFormContext();
                Ecolab.Contact.stateProvince = Ecolab.Common.GetFieldValue("ecl_stateprovinceid");
                if (!Ecolab.Contact.stateProvince) {
                    Ecolab.Common.SetDefaultValue(["address1_postalcode", "address1_stateorprovince"]);
                }
                else {
                    Ecolab.Common.formContext.getAttribute("address1_stateorprovince")?.setValue(Ecolab.Contact.stateProvince[0].name);
                }
            }
        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.FieldOnChange.StateProvince: " + error.message || error.description);
        }
    },

    MobilePhone: function (onChange) {
        "use strict";
        try {
            if (onChange) {
                Ecolab.Common.formContext = onChange.getFormContext();
                Ecolab.Contact.mobilePhone = Ecolab.Common.GetFieldValue("mobilephone");
                var rexp = /^[0-9\\(\\)#+-\\ ]+$/;
                if (Ecolab.Contact.mobilePhone && !rexp.test(Ecolab.Contact.mobilePhone.toLowerCase())) {
                    Ecolab.Common.ShowAlertMessage("Please enter a valid mobile number. Only Digits are allowed along with characters +#()-");
                    return true;
                } else {
                    return false;
                }
            }

        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.FieldOnChange.MobilePhone: " + error.message || error.description);
        }
    }

}

Ecolab.Contact.TabConfig = {
    CDMUserDetails: function () {
        "use strict";
        try {
            if (Ecolab.Contact.showGrantButton || Ecolab.Contact.showCDMButton && Ecolab.Contact.isEmailDomainExist) {
                Ecolab.Common.ShowTabs(["tab_6"], true);
            }
            else {
                Ecolab.Common.ShowTabs(["tab_6"], false);
            }
        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.TabConfig.CDMUserDetails: " + error.message || error.description);
        }
    }

}

Ecolab.Contact.FilterLookup = {
    Account: function () {
        'use strict';
        // Show accounts except the type 'Ship To' and 'Site'
        var accountFilter = "<filter type='and'><condition attribute='customertypecode' operator='ne' value='2' /><condition attribute='customertypecode' operator='ne' value='4' /><condition attribute='statecode' operator='eq' value='0' /></filter>";
        Ecolab.Common.formContext.getControl("parentcustomerid")?.addCustomFilter(accountFilter, "account");
    },

    PrimaryOwner: function () {
        "use strict";
        try {
            if (Ecolab.Contact.Retrieve.account?.owningteam === "team") {
                var fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true' >" +
                    "<entity name='systemuser' >" +
                    "<attribute name='fullname' />" +
                    "<attribute name='ecl_districtid' />" +
                    "<attribute name='systemuserid' />" +
                    "<attribute name='ecl_status1' />" +
                    "<order attribute='fullname' descending='false' />" +
                    "<filter type='and'>" +
                    "<condition attribute='isdisabled' operator='eq' value='0' />" +
                    "</filter>" +
                    "<link-entity name='teammembership' from='systemuserid' to='systemuserid' intersect='true' >" +
                    "<link-entity name='team' from='teamid' to='teamid' intersect='true' >" +
                    "<filter>" +
                    "<condition attribute='teamid' operator='eq' value='" + Ecolab.Contact.Retrieve.account?._ownerid_value + "' />" +
                    "</filter>" +
                    "</link-entity>" +
                    "</link-entity>" +
                    "</entity>" +
                    "</fetch>";
                var viewId = '{00000000-0000-0000-0000-000000000001}';
                var entityName = "systemuser";
                var viewDisplayName = "User District Team Lookup View";
                var layoutXml = "<grid name='resultset' object='1' jump='systemuserid' select='1' icon='1' preview='1'>" +
                    "<row name='result' id='systemuserid'>" +
                    "<cell name='fullname' width='150' />" +
                    "<cell name='ecl_districtid' width='150' />" +
                    "</row>" +
                    "</grid>";
                Ecolab.Common.formContext.getControl("header_ecl_primaryownerid").addCustomView(viewId, entityName, viewDisplayName, fetchXml, layoutXml, true);
            }
        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.FilterLookup.PrimaryOwner: " + error.message || error.description);
        }
    }
}

Ecolab.Contact.Helpers = {
    SetEntityTypeOnParentCustomer: function () {
        try {
            var lookup = Ecolab.Common.formContext.getControl("parentcustomerid");

            if (lookup && lookup.getEntityTypes && lookup.getEntityTypes().length > 1) {
                lookup.setEntityTypes(["account"]);
            }

        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.Helpers.SetEntityTypeOnParentCustomer: " + error.message || error.description);
        }
    }

}

Ecolab.Contact.Create = {
    Account: function (onChange) {
        "use strict";
        try {
            if (Ecolab.Contact.formType === Ecolab.Common.FormType.Create || onChange) {
                if (Ecolab.Contact.Retrieve.account) {
                    //Set Global Business from Account to Contact
                    if (Ecolab.Contact.Retrieve.account.ecl_globalbusiness) {
                        Ecolab.Common.formContext.getAttribute("ecl_globalbusiness")?.setValue(Ecolab.Contact.Retrieve.account.ecl_globalbusiness);
                        Ecolab.Contact.globalBusiness = Ecolab.Contact.Retrieve.account.ecl_globalbusiness;
                    }
                    else {
                        Ecolab.Common.SetDefaultValue(["ecl_globalbusiness"]);
                        Ecolab.Contact.globalBusiness = null;
                    }

                    //Set Primary Owner from Account to Contact
                    if (Ecolab.Contact.Retrieve.account._ecl_primaryownerid_value) {
                        Ecolab.Common.SetLookup(
                            "systemuser",
                            Ecolab.Contact.Retrieve.account?._ecl_primaryownerid_value,
                            Ecolab.Contact.Retrieve.account["_ecl_primaryownerid_value@OData.Community.Display.V1.FormattedValue"],
                            "ecl_primaryownerid"
                        )
                    }
                    else
                        Ecolab.Common.SetDefaultValue(["ecl_primaryownerid"]);

                    //Set Owner from Account to Contact
                    if (Ecolab.Contact.Retrieve.account.owningteam) {
                        Ecolab.Common.SetLookup(
                            "team",
                            Ecolab.Contact.Retrieve.account?._ownerid_value,
                            Ecolab.Contact.Retrieve.account?.owningteam?.name,
                            "ownerid"
                        )
                    }
                    else if (Ecolab.Contact.Retrieve.account.owninguser) {
                        Ecolab.Common.SetLookup(
                            "systemuser",
                            Ecolab.Contact.Retrieve.account?._ownerid_value,
                            Ecolab.Contact.Retrieve.account?.owninguser?.fullname,
                            "ownerid"
                        )
                    }
                    else
                        Ecolab.Common.SetDefaultValue(["ownerid"]);

                    //Set Country from Account    
                    if (Ecolab.Contact.Retrieve.account._ecl_countryid_value) {
                        Ecolab.Common.SetLookup(
                            "ecl_country",
                            Ecolab.Contact.Retrieve.account?._ecl_countryid_value,
                            Ecolab.Contact.Retrieve.account["_ecl_countryid_value@OData.Community.Display.V1.FormattedValue"],
                            "ecl_countryid"
                        )
                    }
                    else
                        Ecolab.Common.SetDefaultValue(["ecl_countryid"]);

                    //Set State from Account    
                    if (Ecolab.Contact.Retrieve.account._ecl_stateprovinceid_value) {
                        Ecolab.Common.SetLookup(
                            "ecl_stateprovince",
                            Ecolab.Contact.Retrieve.account?._ecl_stateprovinceid_value,
                            Ecolab.Contact.Retrieve.account["_ecl_stateprovinceid_value@OData.Community.Display.V1.FormattedValue"],
                            "ecl_stateprovinceid"
                        )
                    }
                    else
                        Ecolab.Common.SetDefaultValue(["ecl_stateprovinceid"]);

                }
                else {
                    Ecolab.Common.SetDefaultValue(["ecl_globalbusiness", "ownerid", "ecl_primaryownerid", "ecl_countryid", "ecl_stateprovinceid"]);
                    Ecolab.Contact.globalBusiness = null;
                }
            }
        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.Create.Account: " + error.message || error.description);
        }

    },

    FormOnLoad: function () {
        "use strict";
        if (Ecolab.Contact.formType === Ecolab.Common.FormType.Create) {
            Ecolab.Common.EnableDisable(["ecl_primaryownerid"], true);
        }
    }

}

Ecolab.Contact.QuickCreate = {
    FormOnLoad: function () {
        "use strict";
        try {
            Ecolab.Contact.QuickCreate.SetAccount();

            Ecolab.Contact.Helpers.SetEntityTypeOnParentCustomer();
        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.QuickCreate.FormOnLoad: " + error.message || error.description);
        }

    },

    SetAccount: function () {
        "use strict";
        try {
            var parent = Xrm.Utility.getPageContext().input.data;
            if (parent) {

                switch (parent.parentrecordtype) {
                    case "opportunity":
                        Ecolab.Common.EnableDisable("parentcustomerid", true);
                        Ecolab.Common.GetEntityDataUsingWebAPIAsync("opportunity", parent.parentrecordid, "_parentaccountid_value", "parentaccountid($select=name)", null, null)
                            .then(
                                function (result) {
                                    if (result && result["_parentaccountid_value"]) {
                                        Ecolab.Common.SetLookup("account", result["_parentaccountid_value"].replace("{", "").replace("}", ""), result.parentaccountid.name, "parentcustomerid");
                                    }
                                })
                            .catch(function (error) {
                                Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.QuickCreate.SetAccount -> Opportunity: " + error.message || error.description);
                            });
                        break;

                    case "ecl_customersetup":
                        Ecolab.Common.EnableDisable("parentcustomerid", true);
                        Ecolab.Common.GetEntityDataUsingWebAPIAsync("ecl_customersetup", parent.parentrecordid, "_ecl_customername_value", "ecl_customername($select=name)", null, null)
                            .then(
                                function (result) {
                                    if (result && result["_ecl_customername_value"]) {
                                        Ecolab.Common.SetLookup("account", result["_ecl_customername_value"].replace("{", "").replace("}", ""), result.ecl_customername.name, "parentcustomerid");
                                    }
                                })
                            .catch(function (error) {
                                Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.QuickCreate.SetAccount -> Customer Setup: " + error.message || error.description);
                            });
                        break;

                    case "msdyn_workorder":
                        Ecolab.Common.EnableDisable("parentcustomerid", true);
                        Ecolab.Common.GetEntityDataUsingWebAPIAsync("msdyn_workorder", parent.parentrecordid, "_msdyn_billingaccount_value", "msdyn_billingaccount($select=name)", null, null)
                            .then(
                                function (result) {
                                    if (result && result["_msdyn_billingaccount_value"] !== null) {
                                        Ecolab.Common.SetLookup("account", result["_msdyn_billingaccount_value"].replace("{", "").replace("}", ""), result.msdyn_billingaccount.name, "parentcustomerid");
                                    }
                                })
                            .catch(function (error) {
                                Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.QuickCreate.SetAccount -> Service Visit: " + error.message || error.description);
                            });
                        break;

                    case "incident":
                        Ecolab.Common.EnableDisable("parentcustomerid", true);
                        Ecolab.Common.GetEntityDataUsingWebAPIAsync("incident", parent.parentrecordid, "_customerid_value", "customerid_account($select=name)", null, null)
                            .then(
                                function (result) {
                                    if (result && result["_customerid_value"]) {
                                        Ecolab.Common.SetLookup("account", result["_customerid_value"].replace("{", "").replace("}", ""), result.customerid_account.name, "parentcustomerid");
                                    }
                                })
                            .catch(function (error) {
                                Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.QuickCreate.SetAccount -> Case: " + error.message || error.description);
                            });
                        break;

                    case "contact":
                        Ecolab.Common.EnableDisable("parentcustomerid", true);
                        Ecolab.Common.SetDefaultValue(["parentcustomerid", "ecl_managerid"]);
                        Ecolab.Common.GetEntityDataUsingWebAPIAsync("contact", parent.parentrecordid, "_parentcustomerid_value", null, null)
                            .then(
                                function (result) {
                                    if (result && result["_parentcustomerid_value"]) {
                                        Ecolab.Common.SetLookup("account", result["_parentcustomerid_value"].replace("{", "").replace("}", ""), result["_parentcustomerid_value@OData.Community.Display.V1.FormattedValue"], "parentcustomerid");

                                        Ecolab.Contact.FieldOnChange.Account(true);
                                    }

                                })
                            .catch(function (error) {
                                Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.QuickCreate.SetAccount -> Contact: " + error.message || error.description);
                            });
                        break;
                    case "ecl_servicerequestservicetype":
                        Ecolab.Common.EnableDisable("parentcustomerid", true);
                        Ecolab.Common.GetEntityDataUsingWebAPIAsync("ecl_servicerequestservicetype", parent.parentrecordid, "_ecl_servicerequestid_value", "ecl_servicerequestid($expand=ecl_billingaccount)")
                            .then(
                                function (result) {
                                    if (result && result.ecl_servicerequestid['_ecl_billingaccount_value']) {
                                        Ecolab.Common.SetLookup("account", result.ecl_servicerequestid['_ecl_billingaccount_value'], result.ecl_servicerequestid['_ecl_billingaccount_value@OData.Community.Display.V1.FormattedValue'], "parentcustomerid");
                                    }
                                })
                            .catch(function (error) {
                                Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.QuickCreate.SetAccount -> Service Request Service Type: " + error.message || error.description);
                            });
                        break;

                    case "ecl_servicerequest":
                        Ecolab.Common.EnableDisable("parentcustomerid", true);
                        Ecolab.Common.GetEntityDataUsingWebAPIAsync("ecl_servicerequest", parent.parentrecordid, "_ecl_billingaccount_value", null, null)
                            .then(
                                function (result) {
                                    if (result && result['_ecl_billingaccount_value'] !== null) {
                                        Ecolab.Common.SetLookup("account", result['_ecl_billingaccount_value'], result['_ecl_billingaccount_value@OData.Community.Display.V1.FormattedValue'], "parentcustomerid");
                                    }
                                })
                            .catch(function (error) {
                                Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.QuickCreate.SetAccount -> Service Request: " + error.message || error.description);
                            });
                        break;
                }
            }
        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.QuickCreate.SetAccount: " + error.message || error.description);
        }
    }

}



Ecolab.Contact.Ribbon.EnableRule = {
    EnableDigital: function () {
        "use strict";
        try {
            if (Contact.showCDMButton && !Ecolab.Contact.isCdmUserAccount
                && !Ecolab.Contact.isInternalContact && Ecolab.Contact.isEmailDomainExist && Ecolab.Contact.isAccountOnboardingEnabled) {
                return true;
            } else
                return false;
        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.Ribbon.EnableRule.EnableDigital: " + error.message || error.description);
        }
    }

}

Ecolab.Contact.Ribbon.Helpers = {
    Retrieve: function () {
        try {
            var retrieveArray = []
            if (Ecolab.Contact.Retrieve.account) {
                var globalRegionText = Ecolab.Contact.Retrieve.account.ecl_globalbusiness ?? accInfo["_ecl_globalregionid_value@OData.Community.Display.V1.FormattedValue"];

                //Validate Enable Onboarding
                if (Ecolab.Contact.Retrieve.account.ecl_customertypecode === Ecolab.Common.AccountType.Customer) {
                    if (globalRegionText === "NA" && [Ecolab.Common.AccountType.NalcoWater, Ecolab.Common.AccountType.EnergyServices].includes(Ecolab.Contact.Retrieve.account.ecl_globalbusiness) && Ecolab.Contact.Retrieve.account.ecl_DistrictId?.ecl_iseligibleforonecustomer !== true) {
                        retrieveArray.push(Ecolab.Contact.Retrieve.SiteAccount());
                    }
                    else {
                        Ecolab.Contact.isAccountOnboardingEnabled = true;
                    }
                }

                //Validate Security Roles
                if (Ecolab.Common.LoggedInUser.isCAM || Ecolab.Common.LoggedInUser.isOpsAdmin ||
                    Ecolab.Common.LoggedInUser.isAccelerator || Ecolab.Common.LoggedInUser.isSalesRepFieldServices) {
                    Ecolab.Contact.showCDMButton = true;
                }
                else
                    Ecolab.Contact.showCDMButton = false;

                //Check CDM Status 
                retrieveArray.push(Ecolab.Contact.Retrieve.CDMUserContact());

                //Check if Email Domain exists
                if (Ecolab.Contact.Retrieve.account.ecl_globalbusiness !== Ecolab.Common.GlobalBusiness.LifeSciences) {
                    var emailDomain = Ecolab.Contact.emailAddress.substring(Ecolab.Contact.emailAddress.search("@") + 1, Ecolab.Contact.emailAddress.length);
                    retrieveArray.push(Ecolab.Contact.Retrieve.EmailDomain(emailDomain));
                }
                else {
                    Ecolab.Contact.isEmailDomainExist = false;
                }

                //Check if Contact is Internal
                var email = Ecolab.Contact.emailAddress.toLowerCase();
                var match = email.match(/\S+@ecolab\.com|\S+@nalco\.com/);
                if (match) {
                    Ecolab.Contact.isInternalContact = true;
                }
                else Ecolab.Contact.isInternalContact = false;

                //Check if CDM User Account exists
                retrieveArray.push(Ecolab.Contact.Retrieve.CDMUserAccount());

                //Wait for all retrieves to complete before refreshing the ribbon
                try {
                    //const res = await Promise.all(retrieveArray);
                    Ecolab.Contact.TabConfig.CDMUserDetails();
                    Ecolab.Common.formContext.ui.refreshRibbon();
                } catch (error) {
                    Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.Ribbon.Helpers.Retrieve.PromiseAll: " + error.message || error.description);
                }

            }
        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.Ribbon.Helpers.Retrieve: " + error.message || error.description);
        }
    }

}

Ecolab.Contact.Ribbon.SubGrid.EnableRule = {
    NewContact: function (primaryControl) {
        "use strict";
        try {
            var formContext = primaryControl;
            return formContext.data.entity.getEntityName().toLowerCase() !== "ecl_basecustomeraccount";
        }
        catch (error) {
            Ecolab.Common.ShowErrorMessageOnScreen("Ecolab.Contact.Ribbon.SubGrid.EnableRule: " + error.message || error.description);
        }
    }
}

