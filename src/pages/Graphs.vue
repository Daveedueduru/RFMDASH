<template>
<div> 
      <visualizationsTable tableType="fullTable"></visualizationsTable>
      <createGraphModal ref="createGraphModal"></createGraphModal>
</div>
</template>

<script>
import VisualizationsTable from '@/components/VisualizationsTable.vue';
import ModalCreateGraph from '@/components/modals/ModalCreateGraph.vue'; 

export default {
  name: 'Graphs',
  components:{
    'visualizationsTable' : VisualizationsTable,
    'createGraphModal': ModalCreateGraph,
  },
  computed: {
  },
  data() {
    return {
    };
  },
  methods: {
    showCreateNewModal(){
      this.$refs.createGraphModal.toggle();
    }
  },
  mounted(){
  }
};

</script>

<style scoped>
</style>
