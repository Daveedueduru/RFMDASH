<template>
<div>
  <h4>Title</h4>
    <input class="form-control" placeholder="Graph Title" maxlength="250" style="width:100%;" v-model="selected.title" v-on:input="updateParent(selected.title)"/>
  <br>
</div>
</template>

<script>

export default {
  name: "Title",
  components: {},
  props:{
    graphType: String
  },
  computed: {},
  data() {
    return {
      selected : {
          title: ''
      }
    }
  },
  methods: {
    updateParent(title){
      if(this.validate(title))
        this.$emit('updateTitle', title);
      else
        this.$emit('updateTitle', null);
    },
    validate(title){
      if(title != null && title.length > 0 && title.length <= 250)
        return true;
      else
        return false;
    },
    setOptions(title){
      this.selected.title = title;
      this.updateParent(title);
    }
  },   
  filters:{
    capitalize: function(value) {
        if (!value) return "";
        value = value.toString();
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
  },
  created(){
    this.selected.title = this.$options.filters.capitalize(this.graphType) + " Graph";
    this.updateParent(this.selected.title);
  }
};
</script>

<style type="text/scss" lang="scss" scoped>
@import "../../../assets/sass/custom-css/_global.scss";

</style>
