<template>
<div>
   <modal ref="modal">
       <template v-slot:header>
           <fai icon="plus-square" />&nbsp; Add Graph
       </template>
       <template v-slot:body>
         <visualizationsTable ref="visualizationsTable" v-on:rowSelectedEvent="rowWasSelected" tableType="selectableTable"></visualizationsTable>
       </template>
       <template v-slot:footer style="display:none;">
           <button class="btn btn-success" id="addGraphButton" v-bind:disabled="addGraphButtonDisabled" v-on:click="addGraph();"><fai icon="plus-square" />&nbsp; Add Graph</button>
       </template>
   </modal>
</div>
</template>

<script>
import VisualizationsTable from '@/components/VisualizationsTable.vue';
import ModalBase from "@/components/modals/ModalBase.vue";

export default {
  name: 'ModalAddGraph',
  components: {
    'visualizationsTable' : VisualizationsTable,
    'modal': ModalBase
  },
  data() {
    return {
      addGraphButtonDisabled: true
    };
  },
  computed: {
  },
  methods: {
      toggle(){
        this.addGraphButtonDisabled = true;
        this.$refs.modal.toggle();
        this.$refs.modal.setModalWidth("75%");
      },
      addGraph(){
        this.$refs.visualizationsTable.addGraph();
        this.$refs.modal.toggle();
      },
      rowWasSelected(selectedRowId){
        this.addGraphButtonDisabled = false;
      }
  }
};

</script>

<style type="text/scss" lang="scss" scoped>
@import "../../assets/sass/custom-css/_global.scss";
</style>
