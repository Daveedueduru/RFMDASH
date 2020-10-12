<template>
  <div>
    <modal ref="modal">
      <template v-slot:header>
        <fai icon="list-alt" />&nbsp; Alert Details
      </template>
      <template v-slot:body>
        <div class v-if="!loading">
          <div class="row">
            <div class="col-sm-4 alertsColumn" style="padding-left:0px">
              <div class="columnBox">
                <span class="alertKey">Alert ID &nbsp;</span>
                <span class="alertValue">{{alertId}}</span>
              </div>
              <div class="columnBox">
                <span class="alertKey">Severity &nbsp;</span>
                <span class="alertValue">{{fields.severity}}</span>
              </div>
              <div class="columnBox">
                <span class="alertKey">Count &nbsp;</span>
                <span class="alertValue">{{fields.occuranceCount}}</span>
              </div>
              <div class="columnBox">
                <span class="alertKey">Name &nbsp;</span>
                <span class="alertValue">{{fields.name}}</span>
              </div>
              <div class="columnBox">
                <span class="alertKey">Network &nbsp;</span>
                <span class="alertValue">{{fields.network}}</span>
              </div>
              <div class="columnBox">
                <span class="alertKey">Site &nbsp;</span>
                <span class="alertValue">{{fields.siteName}}</span>
              </div>
              <div class="columnBox">
                <span class="alertKey">Owner &nbsp;</span>
                <span class="alertValue">{{fields.objectOwner}}</span>
              </div>
              <div class="columnBox">
                <span class="alertKey">Ticket Number &nbsp;</span>
                <span class="alertValue">{{fields.ticketNumber}}</span>
              </div>
              <div class="columnBox">
                <span class="alertKey">Ticket Status &nbsp;</span>
                <span class="alertValue">{{fields.ticketStatus}}</span>
              </div>
              <hr />

              <div class="columnBox" style="margin-bottom:20px;height:100px!important;overflow-y:scroll;background-color:#ffffff!important;">
                <span class="alertKey">Description&nbsp;</span>
                <br />
                <div class="textBox">{{fields.description}}</div>
              </div>

              <div class="columnBox" style="margin-bottom:20px;margin-top:-15px;width:735px;background-color:#ffffff!important;">
                <hr>
                <div class="alertKey" style="margin-bottom:10px;">Django Data&nbsp;</div>
                <div>
                  <div v-for="(alarm, index) in djangoData" :key="index">
                      <div class="columnBox">
                        <span class="alertKey">Alarm ID</span>
                        <span class="alertValue">{{alarm.alarmId}}</span>
                      </div>
                      <div class="columnBox">
                        <span class="alertKey">Event Type</span>
                        <span class="alertValue">{{alarm.eventType}}</span>
                      </div>
                      <div class="columnBox">
                        <span class="alertKey">ID</span>
                        <span class="alertValue">{{alarm.id}}</span>
                      </div>
                      <div class="columnBox">
                        <span class="alertKey">Instance ID</span>
                        <span class="alertValue">{{alarm.eventData.instanceId}}</span>
                      </div>
                      <div class="columnBox">
                        <span class="alertKey">Message</span>
                        <span class="alertValue">{{alarm.eventData.rawMessage}}</span>
                      </div>
                      <div class="columnBox">
                        <span class="alertKey">Event Time</span>
                        <span class="alertValue">{{alarm.eventData.eventTime}}</span>
                      </div>
                    <hr />
                  </div>
                </div>
              </div>
            </div>
            <div class="col-sm-4 alertsColumn">
              <div class="columnBox">
                <span class="alertKey">Update Time &nbsp;</span>
                <span class="alertValue">{{formatValue(fields.updateTime)}}</span>
              </div>
              <div class="columnBox">
                <span class="alertKey">Create Time &nbsp;</span>
                <span class="alertValue">{{formatValue(fields.createTime)}}</span>
              </div>
              <div class="columnBox">
                <span class="alertKey">Change Time &nbsp;</span>
                <span class="alertValue">{{formatValue(fields.changeTime)}}</span>
              </div>
              <div class="columnBox">
                <span class="alertKey">Clear Time &nbsp;</span>
                <span class="alertValue">{{formatValue(fields.clearTime)}}</span>
              </div>
              <hr />
              <div class="columnBox">
                <span class="alertKey">Effected Container &nbsp;</span>
                <span class="alertValue">{{fields.effectedContainer}}</span>
              </div>
              <div class="columnBox">
                <span class="alertKey">Effected Container Type &nbsp;</span>
                <span class="alertValue">{{fields.effectedContainerType}}</span>
              </div>
              <div class="columnBox">
                <span class="alertKey">Effected Object &nbsp;</span>
                <span class="alertValue">{{fields.effectedObject}}</span>
              </div>
              <div class="columnBox">
                <span class="alertKey">Effected Object Type &nbsp;</span>
                <span class="alertValue">{{fields.effectedObjectType}}</span>
              </div>
              <hr />
              <div class="columnBox">
                <span class="alertKey">Reporting Object &nbsp;</span>
                <span class="alertValue">{{fields.reportingObject}}</span>
              </div>
              <div class="columnBox">
                <span class="alertKey">Reporting Object Type &nbsp;</span>
                <span class="alertValue">{{fields.reportingObjectType}}</span>
              </div>
              <div class="columnBox">
                <span class="alertKey">Reporting Container &nbsp;</span>
                <span class="alertValue">{{fields.reportingContainer}}</span>
              </div>
              <div class="columnBox">
                <span class="alertKey">Reporting Container Type &nbsp;</span>
                <span class="alertValue">{{fields.reportingContainerType}}</span>
              </div>
            </div>

            <div
              class="col-sm-4 alertsColumn"
              style="width: 200px;"
            >
              <div
                v-for="(fieldValue, fieldKey) in fields"
                class="columnBox"
                v-bind:key="fieldKey"
                v-if="fieldValue!=='' && fieldValue!='null'"
              >
                <span class="alertKey">{{ fieldKey | capitalize | createSpaces }} &nbsp;</span>
                <span class="alertValue">{{ fieldValue }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else>Loading alert details...</div>
      </template>

      <template v-slot:footer style="display:none!important;">
        &nbsp;
        <!-- <button id="alertCloseModal" type="button" class="close" data-dismiss="modal">close</button> -->
      </template>
    </modal>
  </div>
</template>

<script>
import ModalBase from "@/components/modals/ModalBase.vue";

export default {
  name: "ModalAlertDetails",
  components: {
    modal: ModalBase
  },
  computed: {},

  data() {
    return {
      isBlank: false,
      alertId: "",
      fields: {},
      loading: true,
      djangoData:[]
    };
  },

  methods: {
    toggle() {
      this.alertId = this.$parent.alertId;

      this.$refs.modal.toggle();
      this.$refs.modal.setModalWidth("80%");
      this.$refs.modal.setModalHeight("550px");
      this.getAlertDetails();
      this.fetchDjangoData();
    },
    getAlertDetails: function() {
      var self = this;
      var uri = "/conflux/alertdetails";
      var payload = { alertId: this.alertId };
      var headers = { headers: { "Content-Type": "application/json" } };
      this.loading = true;
      this.axios
        .post(uri, payload, headers)
        .then(function(response) {
          //console.log(response)
          self.fields = self.sortObject(response.data[0]);
          self.isBlank = false;
          self.loading = false;
        })
        .catch(error => {
          console.error(error);
        });
    },
    fetchDjangoData: function(){
      var self = this;
      var uri = "/conflux/dashdata";
      var payload = {"alertId": "12345678"};
      var headers = {
        headers: { "Content-Type": "application/json" },
        responseType: "json",
        timeout: 30000
      };
      this.axios.post(uri, payload, headers).then(function(response) {
        self.djangoData = response.data;
        console.log(self.djangoData);
      }).catch(error => {
        
      });
    },
    sortObject(obj) {
      return Object.keys(obj)
        .sort()
        .reduce(function(result, key) {
          result[key] = obj[key];
          return result;
        }, {});
    },
    formatValue: function(value) {
      if (value == undefined || value == null || value.toLowerCase() == "null")
        value == "";
      if (this.$moment(value, "YYYY-MM-DD\\THH:mm:ss\\Z").format("YYYY-MM-DD\\THH:mm:ss\\Z") === value) 
        value = this.$moment(value, "YYYY-MM-DD\\THH:mm:ss\\Z").format("YYYY/MM/DD HH:mm:ss \\G\\M\\T");
      return value;
    },
    counter: function() {
      // this.isBlank = this.$parent.isBlank;
      // this.isBlank = true;
      // alert(this.isBlank)
      // alert("before "+this.isBlank)

      this.isBlank = this.isBlank ? false : true;
      //alert("after "+this.isBlank)
    }
  },
  filters: {
    capitalize: function(value) {
      if (!value) return "";
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
    createSpaces: function(value) {
      var outString = "";
      for (var i = 0; i < value.length; i++) {
        var char = value.charAt(i);
        if (char == char.toUpperCase() && i != 0) outString += " ";
        outString += char;
      }
      return outString;
    }
  },
  mounted: function() {}
};
</script>

<style type="text/scss" lang="scss" scoped>
@import "../../assets/sass/custom-css/_global.scss";

.columnBox {
  font-size: 12px;
  margin: 0px;
  overflow: auto;
  padding-left: 5px;
  padding-right: 5px;
  padding-bottom: 1px;
  padding-top: 1px;
  cursor: default;
  border-radius: 4px;
}
.alertKey {
  font-weight: bold;
  vertical-align: top;
  font-size: 12px;
  font-family: verdana;
}
.alertValue {
  float: right;
  display: inline-block;
  white-space: normal;
  word-break: break-all;
  font-size: 12px;
  font-family: verdana;
}

.columnBox:nth-child(odd) {
  background-color: #f5f5f5;
}

.alertsColumn {
  padding-left: 10px;
  padding-right: 10px;
}

hr {
  display: block;
  overflow: hidden;
  border-style: inset;
  border-width: 1px;
}

.textBox {
  margin-top: 3px;
  font-size: 12px;
  font-family: verdana;
}

.close {
  margin-top: 5px !important;
  margin-right: 5px;
}

.button {
  background-color: #48d597; /* Green */
  border: none;
  color: black;
  padding: 6px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
}

.button3 {
  border-radius: 8px;
}
</style>
