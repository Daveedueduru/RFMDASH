<template>
<div>
   <modal ref="modal">
       <template v-slot:header>
           <span v-if="currentView == 'graphType'"><fai icon="chart-line" />&nbsp; Create Graph</span>
           <span v-else-if="!editing"><fai :icon="getIconBySelectedType(selectedType)" />&nbsp; Create Graph</span>
           <span v-else-if="editing"><fai icon="edit" />&nbsp; Edit Graph</span>
       </template>
       <template v-slot:body>

           <div id="selectType" v-if="currentView == 'graphType'">
             <div class="row">
               <div class="col-sm-3" v-for="graphType in graphTypes" :key="graphType.id">
                  <div class="graphTypeBox" v-on:click="selectGraphType(graphType)" v-bind:class="{selectedGraphBox: selectedType == graphType.value , disabledGraphBox: graphType.disabled}">
                    <div class="graphTypeBoxHeader" v-text="graphType.name"></div>
                    <div class="graphTypeBoxIcon"><fai :icon="graphType.icon" /></div>
                  </div>
                </div>
             </div>
             <div style="margin-top:-25px;"></div>
           </div>

          <div id="selectProperties" v-if="currentView == 'graphProperties'">
            <createGraphBase ref="createGraphBase" @readyForSave="validateGraphInputs" :graphType="selectedType"></createGraphBase>
          </div>

       </template>
       <template v-slot:footer>
           <button class="btn btn-success" id="nextButton" v-if="currentView == 'graphType'" v-bind:disabled="selectedType==''" v-on:click="goToGraphPropertiesView()"><fai icon="arrow-right" />&nbsp; Next</button>
           <div id="backWrapper"  v-if="currentView == 'graphProperties' && !editing"><button class="btn btn-success" id="backButton" :disabled="disableSaveWhileSaving" v-on:click="goToGraphTypeView()"><fai icon="arrow-left" />&nbsp; Back</button></div>
           <button class="btn btn-success" id="saveButton" v-if="currentView == 'graphProperties'" v-on:click="saveGraph();" :disabled="!areGraphInputsValid || disableSaveWhileSaving"><fai icon="save" />&nbsp; Save Graph</button>
       </template>
   </modal>
</div>
</template>

<script>
import ModalBase from "@/components/modals/ModalBase.vue";
import CreateGraphBase from "@/components/modals/create/CreateGraphBase.vue";

export default {
  name: 'ModalCreateGraph',
  components: {
    'modal': ModalBase,
    'createGraphBase': CreateGraphBase
  },
  computed: {
  },
  data() {
    return {
        currentView: "graphType",
        selectedType: "",
        disableSaveWhileSaving: false,
        graphTypes : [
          {"name":"Line", "value":"line", "icon":"chart-line" , "disabled":false},
          {"name":"Area", "value":"area", "icon":"chart-area" , "disabled":false},
          {"name":"Bar", "value":"bar", "icon":"chart-bar" , "disabled":false},
          {"name":"Pie", "value":"pie", "icon":"chart-pie" , "disabled":false},
          // {"name":"Data Table", "value":"table", "icon":"table" , "disabled":true},
          {"name":"Metric", "value":"metric", "icon":"calculator" , "disabled":false},
          {"name":"Word Cloud", "value":"wordcloud", "icon":"cloud" , "disabled":false},
          {"name":"Pin Map", "value":"pinmap", "icon":"map-marker-alt" , "disabled":false},
          {"name":"Heat Map", "value":"heatmap", "icon":"map" , "disabled":false}
        ],
        areGraphInputsValid: false,
        editing: false,
        editGraphObject: null
    };
  },
  methods: { 
      toggle(){
        this.resetAllValues();
        this.$refs.modal.toggle(); 
      },
      resetAllValues(){
        this.areGraphInputsValid = false;
        this.currentView = "graphType";
        this.selectedType = "";
        this.editing = false;
        this.editGraphObject = null;
      },
      goToGraphPropertiesView(){
        this.currentView = 'graphProperties';
        this.$refs.modal.setModalWidth("87%");
      },
      goToGraphTypeView(){
        this.areGraphInputsValid = false;
        this.currentView = 'graphType';
        this.$refs.modal.setModalWidth("800px");
      },
      selectGraphType(graphType){
        if(graphType.disabled == false)
          this.selectedType = graphType.value;
      },
      getIconBySelectedType(selectedType){
        for (let i = 0; i < this.graphTypes.length; i++)
          if(this.graphTypes[i].value == selectedType)
            return this.graphTypes[i].icon;
        return "chart-line";
      },
      setGraphType(graphTypeRaw){
        this.selectedType = graphTypeRaw;
      },
      setDisableSaveWhileSaving(trueOrFalse){
        this.disableSaveWhileSaving = trueOrFalse;
      },
      validateGraphInputs(valid){
        this.areGraphInputsValid = valid;
      },
      saveGraph(){
        this.$refs.createGraphBase.save(this.editGraphObject);
      },
      openCreateGraphForEdit(graphObject){
        this.toggle();
        this.editing = true;
        this.editGraphObject = graphObject;
        this.setGraphType(graphObject.type);
        this.goToGraphPropertiesView();
        var self = this;
        this.$nextTick(() => { // Wait for the next tick so that v-if has time to load the component before we attempt to access an undefined $ref.
          self.$refs.createGraphBase.setGraph(graphObject);
          self.$refs.createGraphBase.$refs.graphPreview.createGraphPreview();
        });
      }
  },
  mounted(){
  }
};
</script>

<style type="text/scss" lang="scss" scoped>
@import "../../assets/sass/custom-css/_global.scss";

.graphTypeBox{
  border:solid 1px $ctl-border-gray;
  min-height:135px;
  border-radius:4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .1);
  margin-bottom:25px;
}
.graphTypeBox:hover{
  box-shadow: 0 2px 8px rgba(0, 0, 0, .45);
  cursor: pointer;
}
.graphTypeBoxHeader{
  text-align: center;
  font-size:22px;
  margin-top:8px;
  color: $ctl-medium-gray;
}
.graphTypeBoxIcon{
  font-size:55px;
  text-align: center;
  color: $ctl-medium-gray;
}
.selectedGraphBox{
  border:solid 2px $ctl-vibrant-blue!important;
  box-shadow: 2px 2px 8px #4d5bffd4;
  color:$ctl-vibrant-blue!important;
}
.selectedGraphBox .graphTypeBoxHeader{
  color:$ctl-vibrant-blue!important;
}
.selectedGraphBox .graphTypeBoxIcon{
  color:$ctl-vibrant-blue!important;
}
#backWrapper{
  width: 100%;
}
#backButton{
  float:left;
}
.disabledGraphBox{
  background-color:$ctl-dark-gray!important;
}
.disabledGraphBox:hover{
  box-shadow: 0 0px 0px rgba(0, 0, 0, 0)!important;
  cursor: default!important;
}
</style>
