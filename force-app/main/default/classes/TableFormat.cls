public with sharing class TableFormat
 {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() 
    {
    return [SELECT Id, Name, Phone FROM Account];
    }
}