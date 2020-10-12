<template>
<div>
    <h4>Custom Query</h4>
    <input class="form-control" placeholder="Query String" maxlength="250" style="float:left;width:64%;" v-model="selected.query"/>

    <div class="createGraphInputfieldContainer" style="width:33%;;margin-left:3%;" v-show="graphType == 'bar'">
      <div class="createGraphInputLabel">Orientation</div>
      <select  class="form-control" v-model="selected.flipAxis">
          <option v-for="(sel,index) in [{name:'Standard (Vertical)',val:false},{name:'Flip Axis (Horizontal)',val:true}]" :key="index" :value="sel.val">{{sel.name}}</option> 
      </select>
    </div>

    <div style="height:0px;clear:both;"></div><br>
</div>
</template>

<script>

export default {
  name: "Query",
  components: {},
  props:{
    graphType: String
  },
  computed: {},
  watch: {
    selected: { 
        handler(){
            this.updateParent();
        },
        deep: true
    }
  },
  data() {
    return {
      selected : {
          query: '',
          flipAxis: false
      }
    }
  },
  methods: {
    updateParent(){
      if(this.validate(this.selected.query))
        this.$emit('updateQuery', this.selected.query, this.selected.flipAxis);
      else
        this.$emit('updateQuery', null);
    },
    validate(query){
      if(query.length <= 250)
        return true;
      else
        return false;
    },
    setOptions(query,flipAxis){
      this.selected.query = query;
      this.selected.flipAxis = flipAxis;
    }
  },
  mounted() {

  }
};
</script>

<style type="text/scss" lang="scss" scoped>
@import "../../../assets/sass/custom-css/_global.scss";

</style>
