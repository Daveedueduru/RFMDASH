<template>
<div>

  <h4>Y Axis</h4>
  <div class="createGraphInputfieldContainer" style="width:64%;">
    <select class="form-control" v-model="selected.yAxisAgg" v-on:change="aggChanged()">
        <option selected disabled value="">Select An Aggregate</option>
        <option v-for="yAxisAgg in yAxisAggs" :key="yAxisAgg.name" :value="yAxisAgg.name" :disabled="yAxisAgg.disabled">{{yAxisAgg.name}}</option> 
    </select>
  </div>

  <div class="createGraphInputfieldContainer" style="width:33%;margin-left:3%;" v-if="selected.yAxisAgg != '' && selected.yAxisAgg != 'Count' && selected.yAxisAgg != 'UniqueCount'">
    <div class="createGraphInputLabel">Field</div>
    <select class="form-control"  v-model="selected.yAxisField" >
        <option selected disabled value="">Select A Field  (Numbers)</option>
        <option v-for="field in numberFields" :key="field.name" :value="field.name">{{field.name}}</option> 
    </select>
  </div>

  <div class="createGraphInputfieldContainer" style="width:33%;;margin-left:3%;" v-if="selected.yAxisAgg != '' && selected.yAxisAgg == 'UniqueCount'">
    <div class="createGraphInputLabel">Field</div>
      <v-select placeholder="Select A Field (Any)" label="name" :reduce="field=>field.name" :options="fields" v-model="selected.yAxisField" />
  </div>

  <div style="clear:both;"></div><br>
</div>
</template>

<script>

export default {
  name: "YAxis",
  components: {},
  props:{
    fields : Array,
    graphType: String
  },
  computed: {
    numberFields(){
        var out = [];
        for (let i = 0; i < this.fields.length; i++) {
            if(this.fields[i].type == "long" || this.fields[i].type == "double")
            out.push(this.fields[i]);
        }
        return out;
    },
    dateFields(){
        var out = [];
        for (let i = 0; i < this.fields.length; i++) {
            if(this.fields[i].type == "date")
            out.push(this.fields[i]);
        }
        return out;
    }
  },
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
          yAxisAgg: 'Count',
          yAxisField: ''
      },
      yAxisAggs:[
        { name: "Count" , field: null , disabled:false},
        { name: "Average" , field: "number" , disabled:false},
        { name: "Sum" , field: "number" , disabled:false},
        { name: "Median" , field: "number" , disabled:false},
        { name: "Min" , field: "number" , disabled:false},
        { name: "Max" , field: "number", disabled:false },
        { name: "UniqueCount" , field: "any" , disabled:false}
      ]
    }
  },
  methods: {
    updateParent(){
      this.$emit('updateYAxis',null);
      if(this.selected.yAxisAgg == "Count"){
        this.$emit('updateYAxis', {
          "aggregate": this.selected.yAxisAgg,
          "field": ""
        });
      }
      else if(this.selected.yAxisAgg == "UniqueCount" && this.selected.yAxisField != ""){
        this.$emit('updateYAxis', {
          "aggregate": this.selected.yAxisAgg,
          "field": this.selected.yAxisField + ".keyword"
        });
      }
      else if(this.selected.yAxisAgg != "UniqueCount" && this.selected.yAxisAgg != "Count" && this.selected.yAxisField != ""){
        this.$emit('updateYAxis', {
          "aggregate": this.selected.yAxisAgg,
          "field": this.selected.yAxisField
        });
      }
    },
    aggChanged(){
      this.selected.yAxisField = "";
    },
    setOptions(yAxis){
      var self = this;
      this.selected.yAxisField = yAxis.field.replace('.keyword','');
      this.selected.yAxisAgg = yAxis.aggregate;
      this.updateParent();
    }
  },
  created(){
    this.updateParent();
  }
};
</script>

<style type="text/scss" lang="scss" scoped>
@import "../../../assets/sass/custom-css/_global.scss";

</style>
