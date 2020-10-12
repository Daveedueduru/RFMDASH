<template>
<div> 
    <div class="row">
        <div class="col-sm-4" style="padding-left:5px;padding-right:0px;">
            <v-ctk-datetimepicker 
                :no-value-to-custom-elem="true"
                v-model="startTime" 
                class="dtp" 
                inputSize="sm"
                color="#0047bb"
                button-color="#0047bb"
                format="MM/DD/YY HH:mm"
                :no-button-now="true"
                :noHeader="true"
                minute-interval="5"
                v-on:input="setStartTime(startTime,true)"
            >
            <button class="btn btn-info dtpButton"><fai icon="calendar-alt" />&nbsp; {{startTimeParsed}}</button>
            </v-ctk-datetimepicker>
        </div>
        <div class="col-sm-4" style="padding-left:10px;padding-right:19x;">
            <v-ctk-datetimepicker 
                :no-value-to-custom-elem="true"
                v-model="endTime"
                class="dtp" 
                inputSize="sm"
                color="#0047bb"
                button-color="#0047bb"
                format="MM/DD/YY HH:mm"
                :no-button-now="true"
                :noHeader="true"
                minute-interval="5"
                v-on:input="setEndTime(endTime,true)"
            >
            <button class="btn btn-info dtpButton"><fai icon="calendar-alt" />&nbsp; {{endTimeParsed}}</button>
            </v-ctk-datetimepicker>
        </div>
        <div class="col-sm-4" style="padding-right:0px;">
            <v-select  id="quickTimeSelect" placeholder="Quick Times" :options="quickTimeValues" v-model="selectedQuickTime" />
        </div>
    </div>
</div>
</template>

<script>
//https://www.npmjs.com/package/vue-ctk-date-time-picker 
//https://chronotruck.github.io/vue-ctk-date-time-picker

export default {
  name: 'DateTimePicker',
  components:{
  },
  computed: {
    startTimeParsed(){
        if(this.startTime == null)
            return "Start Time";
        else
            return "From: " + this.$moment(this.startTime,"MM/DD/YY HH:mm").format('MMM Do HH:mm');
    },
    endTimeParsed(){
        if(this.endTime == null)
            return "End Time";
        else
            return "To: " + this.$moment(this.endTime,"MM/DD/YY HH:mm").format('MMM Do HH:mm');
    }
  },
  data() {
    return {
        startTime : null,
        endTime: null,
        selectedQuickTime: "",
        quickTimeValues: [
          "Last Hour",
          "Last 4 Hours",
          "Last Day",
          "Last Week",
          "Last Month",
          "Last 3 Months",
          "Last 6 Months"
      ]
    };
  },
  watch:{
      selectedQuickTime(qt){
          switch (qt) {
            case "Last Hour":   this.setQuickTimes(1,'hours');break;
            case "Last 4 Hours":this.setQuickTimes(4,'hours');break;
            case "Last Day":    this.setQuickTimes(1,'days');break;
            case "Last Week":   this.setQuickTimes(7,'days');break;
            case "Last Month":  this.setQuickTimes(1,'months');break;
            case "Last 3 Months":this.setQuickTimes(3,'months');break;
            case "Last 6 Months":this.setQuickTimes(6,'months');break;
            default:break;
          }
      }
  },
  methods: {
    loadStartTime(){
        if(localStorage.getItem("startTime") !== null)
            this.startTime = this.$moment(localStorage.getItem("startTime"), 'YYYY-MM-DD\\THH:mm:ss\\Z').format("MM/DD/YY HH:mm"); 
        else{
            this.startTime = this.$moment.utc().subtract(this.$moment.duration({'days' : 30})).format("MM/DD/YY HH:mm"); 
            this.setStartTime(this.startTime);
        }
    },
    loadEndTime(){
        if(localStorage.getItem("endTime") !== null)
            this.endTime = this.$moment(localStorage.getItem("endTime"), 'YYYY-MM-DD\\THH:mm:ss\\Z').format("MM/DD/YY HH:mm");
        else{
            this.endTime = this.$moment.utc().format("MM/DD/YY HH:mm");
            this.setEndTime(this.endTime);
        }
    },
    setStartTime(startTime,resetQuickTimes){
        if(resetQuickTimes)
            this.selectedQuickTime = "";
        localStorage.setItem("startTime", this.$moment(startTime,"MM/DD/YY HH:mm").format("YYYY-MM-DD\\THH:mm:ss\\Z"));
        this.$root.$emit('updateGraphContents', true);
    },
    setEndTime(endTime,resetQuickTimes){
        if(resetQuickTimes)
            this.selectedQuickTime = "";
        localStorage.setItem("endTime", this.$moment(endTime,"MM/DD/YY HH:mm").format("YYYY-MM-DD\\THH:mm:ss\\Z"));
        this.$root.$emit('updateGraphContents', true);
    },
    setQuickTimes(num,time){
        var now = this.$moment.utc().format("MM/DD/YY HH:mm");
        this.startTime = this.$moment.utc().subtract(num, time).format("MM/DD/YY HH:mm");;
        this.endTime = now;
        this.setStartTime(this.startTime,false);
        this.setEndTime(this.endTime,false);
    }
  },
  created(){
      this.loadStartTime();
      this.loadEndTime();
  }
};

</script>

<style type="text/scss" lang="scss" scoped>
@import "../assets/sass/custom-css/_global.scss";
.dtpButton{
    width:174px;

    background-color: $ctl-light-gray;
    border-color: $ctl-light-gray;
    color: $ctl-medium-gray;

    padding-right:0px;
    padding-left:0px;
}
.dtpButton:focus{
    box-shadow: none!important;
    background-color: $ctl-vibrant-blue;
    border-color: $ctl-vibrant-blue;
    color: $ctl-white;
}
#quickTimeSelect{
    height:36px!important;
    margin-top:15px;
    background-color: white;
    border-radius: 4px;
    min-width:140px;
    width:100%;
}
</style>
