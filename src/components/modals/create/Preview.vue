<template>
<div>
  <div id="previewGraphContainer">
    <h4>Preview<button :disabled="!this.$parent.areGraphInputsValid" class="btn btn-info" id="previewButton" v-on:click="createGraphPreview()"><fai icon="play" /></button></h4>
    <div id="previewGraph">
      <graphContent ref="previewGraph" :graphObject="graph" :loadGraphOnCreate="false" :isPreview="true"></graphContent>
    </div>
  </div>
</div>
</template>

<script>
import GraphContent from "@/components/graphs/GraphContent.vue";

export default {
  name: "Preview",
  components: {
    graphContent: GraphContent
  },
  props:{},
  computed: {
  },
  data() {
    return {
      previewRequested: false,
      graph: {
        "graphs" : [{
          type: "line",
          preview: "preview"
        }]
      }
    }
  },
  methods: {
    createGraphPreview(){ 
      this.previewRequested = true;
      this.graph = this.$parent.getParsedGraph();
      // Need to debounce this a bit because there is some kind of atomic delay between the graph prop being updated in the child and the following child call using the 'older' prop that even nextTick can't solve alone.
      var self = this; 
      var debounceForGraphProp = this.lodash.debounce(function(){
        self.$nextTick(() => { 
            self.$refs.previewGraph.drawGraph();
        });
      }, 101);
      debounceForGraphProp();
    }
  },
  mounted() {
  }
};
</script>

<style type="text/scss" lang="scss" scoped>
@import "../../../assets/sass/custom-css/_global.scss";
#previewGraph{
  position: relative;
  width:100% !important;
  height:100%!important;
  min-height:325px!important;
  border:solid 1px $ctl-border-gray;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .1);
  border-radius:4px;
  margin-right:20px;
}
#previewButton{
  float: right;
  vertical-align: middle;
  margin-top:-3px;
  height: 30px;
  padding-top: 3px;
  min-width:60px;
  margin-right:1px;
}
.responsiveChart{
  border-radius:4px;
}
</style>
