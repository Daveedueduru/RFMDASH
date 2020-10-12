<template>
<div>
   <modal ref="modal">
       <template v-slot:header>
           <fai icon="th" />&nbsp; {{newOrEdit}} Dashboard
       </template>
       <template v-slot:body>
            <h4>Name</h4>
            <input class="form-control" type="text" id="dashboardNameInputField" v-model="selected.name" placeholder="Dashboard Name"/>
            <h4>Permissions</h4>
            <div id="dashboardScopeCheckBoxes">
                <div class="form-check form-check-inline" style="margin-right:15px;">
                    <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" v-model="selected.permission" v-bind:value="'private'">
                    <label class="form-check-label unselectable" for="inlineRadio2">Private (only you can view/edit)</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" v-model="selected.permission" v-bind:value="'public'">
                    <label class="form-check-label unselectable" for="inlineRadio1">Public (everyone can view)</label>
                </div>
            </div>
       </template>
       <template v-slot:footer style="display:none;">
           <button class="btn btn-success" id="saveLayoutButton" v-bind:disabled="saveLayoutButtonDisabled" v-on:click="saveLayout();"><fai icon="save" />&nbsp; Save Dashboard</button>
       </template>
   </modal>
</div>
</template>

<script>
import ModalBase from "@/components/modals/ModalBase.vue";

export default {
  name: 'ModalSaveLayout',
  components: {
    'modal': ModalBase
  },
  watch: {
    selected: { 
        handler(){
            if(this.selected.name.length > 3 && this.selected.name != "Home Dashboard")
                this.saveLayoutButtonDisabled = false;
            else
                this.saveLayoutButtonDisabled = true;
        },
        deep: true
    }
  },
  data() {
    return {
        saveLayoutButtonDisabled: true,
        newOrEdit: "New",
        selected: {
            name: "",
            permission: "private"
        }
    };
  },
  methods: {
      toggle(){
        this.resetInputs();
        this.checkIfUpdatingExistingDashboard();
        this.addGraphButtonDisabled = true;
        this.$refs.modal.toggle();
        this.$refs.modal.setModalWidth("45%");
      },
      resetInputs(){
        this.selected = {
            name: "",
            permission: "private"
        };
        this.newOrEdit = "New";
      },
      checkIfUpdatingExistingDashboard(){
            if(localStorage.getItem("dashboardSettings") !== null){
                var dashboardSettings = JSON.parse(localStorage.getItem("dashboardSettings"));
                if(dashboardSettings.id == "dashId." +localStorage.getItem("username") + ".layout"){
                    this.newOrEdit = "New";
                }
                else{
                    this.newOrEdit = "Edit";
                    this.selected = {
                        name: dashboardSettings.name,
                        permission: dashboardSettings.permission
                    };
                }
            }
      },
      saveLayout(){
        var username = localStorage.getItem("username");
        var currentDate = Date.now();
        var layout = [];
        if(localStorage.getItem("layout") !== null)
          layout = JSON.parse(localStorage.getItem("layout"));
        if(layout.length == 0){
            alert("Error: You can't save an empty dashboard!");
            return;
        }
        var dashboardSettings = {
            name: this.selected.name,
            permission: this.selected.permission,
            id: "dashId." + username + "." + currentDate + ".layout"
        };
        if(this.newOrEdit == "Edit"){ // If this is an edit, set the id to the loaded dashboard instead to update it instead of creating a new one.
            dashboardSettings.id = JSON.parse(localStorage.getItem("dashboardSettings")).id;
        }
        
        localStorage.setItem("dashboardSettings",JSON.stringify(dashboardSettings));
        this.$root.$emit('saveNewEditedLayout', layout, "reloadDashboards");
        this.$refs.modal.toggle();
        this.resetInputs();
      }
  },
  mounted(){
    
  }
};

</script>

<style type="text/scss" lang="scss" scoped>
@import "../../assets/sass/custom-css/_global.scss";
h4{
    margin-bottom:10px;
}
#dashboardNameInputField{
    margin-bottom:25px;
}
#dashboardScopeCheckBoxes{
    margin-left:2px;
}

.form-check-inline input,label{
     cursor: pointer!important;
     margin-right:0px;
}
.form-check-inline label{
    padding-left:5px;
}
</style>
