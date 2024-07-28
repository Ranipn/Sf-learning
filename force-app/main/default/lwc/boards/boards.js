import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Board_Object from '@salesforce/schema/Board__c';
import NAME_FIELD from '@salesforce/schema/Board__c.Name';
import DESCRIPTION_FIELD from '@salesforce/schema/Board__c.Description__c';
import NOOFSECTION_FIELD from '@salesforce/schema/Board__c.Number_of_Sections__c';
import saveBoard from '@salesforce/apex/BoardController.saveBoard';
import getBoards from '@salesforce/apex/BoardController.getBoards';

import { NavigationMixin } from 'lightning/navigation';

const COLUMNS=[
    {label:'Name', fieldName:'Name'},
    {label:'Description', fieldName:'Description__c'},
    {label:'No of Sections', fieldName:'Number_of_Sections__c'},
    {
        type:"button", typeAttributes:{
            label:'Open Board',
            name:'openBoard',
            title:'Open Board',
            value:'openBoard'
        }
    }


]
export default class Boards extends NavigationMixin(LightningElement) 
{
    columns=COLUMNS;
    objectApiName=Board_Object;
    showModalPopUp=false;
    nameField=NAME_FIELD;
    descriptionField=DESCRIPTION_FIELD;
    noofSectionField=NOOFSECTION_FIELD;
    sections=[];

    @wire(getBoards)
    boards;

    newBoardClickHandler()
    {
        this.showModalPopUp=true;
    }
    popUpClosedHandler()
    {
        this.showModalPopUp=false;  
    }
    noOfSectionChangeHandler(event)
    {
     let noOfSections=event.target.value;
     this.sections=[];
     for(let i=0; i<noOfSections; i++)
     {
        this.sections.push({id:i, sectionLabel:`Section ${i+1} Title`});
     }
    }
    async handleSubmit(event)
    {
        event.preventDefault();
        const fields={ ...event.detail.fields };
        let sectionControls=this.template.querySelectorAll('[data-section-control]');
        let sectionList=[];
        for(let control of sectionControls)
        {
            sectionList.push({Name:control.value}); 
         }

         if(!this.validateData(fields, sectionList))
         {
            return;
         }

         let result= await saveBoard({'board': fields, 'sections':sectionList });
         this.popUpClosedHandler();
         this.showToast('Data saved successfully');

    }

    validateData(fields, sectionList)
    {
        let sectionCount=parseInt(fields.Number_of_Sections__c);
        if(!sectionCount || sectionCount<1 || sectionCount>10)
        {
            this.showToast('Please enter valid number of sections value between 1 to 10', 'Error', 'error');
            return false;
        }
        if(sectionList.filter(a => a.Name =='').length>0)
        {
            this.showToast('Please enter title for every section.', 'Error', 'error');
            return false;
        }
        return true;

    }

    rowActionHandler(event)
    {
        let boardId=event.detail.row.Id;
        const actionName=event.detail.action.name;
        if(actionName=='openBoard')
        {
           this.navigateToBoardRecordPage(boardId)
        }

    }

    navigateToBoardRecordPage(boardId)
    {
        this[NavigationMixin.Navigate]
        (
            {
                type:'standard__recordPage',
                attributes:
                {
                    recordId:boardId,
                 objectApiName:Board_Object,
                 actionName:'view'
                }
            } )
   

}
    showToast(message, title = 'Success', variant = 'success') {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }
}