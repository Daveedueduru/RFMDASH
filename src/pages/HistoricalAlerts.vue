<template>
  <div
    :style="{ height: (windowHeight - 160) + 'px'}"
    style="background-color:white;"
    v-on:resize="handleResize($event)"
  >
    <div class="row searchRow">
      <div class="col-md-7">
        <input
          v-model="searchQuery"
          class="form-control"
          placeholder="Search Alerts"
          @keyup.enter="executeSearch()"
        />
      </div>
      <!-- <div class="col-md-2">
        <select disabled v-model="flag" class = "form-control" v-on:change="drop"> <option value="historic" selected>Historic</option> <option value="realtime">Real-Time</option> <option value="both">Both</option></select>
      </div>-->
      <!-- <div class="col-md-2">
        <select v-model="perPage" class="form-control" v-on:change="pageLength">
          <option value="25" selected>25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div> -->
      <div class="col-md-3">
        <v-select
          id="fieldsDropdown"
          v-model="dropvalues"
          multiple
          :options="finalFields"
          label="label"
          :close-on-select="true"
          @input="console"
          placeholder="Select Column To Show"
        />
      </div>
      <div class="col-md-2">
        <button
          v-if="dropvalues.length == 0"
          type="button"
          class="btn btn-success resetButton searchBarItem"
          v-on:click="console"
        >
          <fai icon="redo" style="font-size:14px;" />&nbsp; Reset
        </button>
      </div>
    </div>

    <div
      class="contentContainer"
      style="padding-right:0px;margin-bottom:10px;background-color:white;"
    >
      <div class="row">
        <div class="col-12">
          <div
            class="tablewrapper"
            :style="{ height: (windowHeight - 225) + 'px' }"
            style="border-bottom:1px solid #dddddd"
          >
            <table class="table">
              <thead>
                <tr>
                  <th v-for="col in selected" :key="col">
                    {{col | capitalize | createSpaces}}
                    <!-- <div
                      class="arrow"     ///// v-on:click="sortTable(col)" /////
                       v-if="col == sortColumn"
                      v-bind:class="[ascending ? 'arrow_up' : 'arrow_down']"
                    ></div> -->
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(alert,index) in paginate(alerts)"
                  :key="index"
                  :class="{ selected: alert.id }"
                >
                  <td
                    v-for="col in selected"
                    :key="col"
                    @click="rowselect(alert.id)"
                  >{{ formatValue(alert[col]) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <!-- <ul class="pagination" style="float:right;margin-right:15px;margin-top:5px;">
        <li class="page-item">
          <button
            :disabled="isLoading"
            type="button"
            class="page-link"
            v-on:click="getPrevious()"
            v-if="page != 1"
          >Previous</button>
        </li>
        <li
          v-for="(pageNumber, index) in pages.slice(page-1, page+4)"
          :key="pageNumber"
          class="page-item"
        >
          <button
            :disabled="isLoading"
            type="button"
            class="page-link"
            :class="{ 'active' : index === 0}"
            v-on:click="getAlerts(pageNumber)"
            @click="page = pageNumber"
          >{{pageNumber}}</button>
        </li>
        <li class="page-item">
          <button
            :disabled="isLoading"
            type="button"
            v-on:click="getNext()"
            v-if="page < pages.length"
            class="page-link"
          >Next</button>
        </li>
      </ul> -->
      <div style="float:right;padding-right:15px;margin-top:13px;">Found <b>{{alert}}<div style="display:inline-block;" v-if="alert > this.perPage">+</div></b> alerts</div>
      <div style="clear:both;"></div>
    </div>
    <alertDetailsModal ref="alertDetailsModal"></alertDetailsModal>
  </div>
</template>

<script>
import DateTimePicker from "@/components/DateTimePicker.vue";
import ModalAlertDetails from "@/components/modals/ModalAlertDetails.vue";
import _ from "lodash";

export default {
  name: "HistoricalAlerts",
  props: {},
  components: {
    dateTimePicker: DateTimePicker,
    alertDetailsModal: ModalAlertDetails
  },

  data() {
    return {
      page: 1,
      perPage: 500,
      pages: [],
      isLoading: false,
      isTyping: false,
      ascending: false,
      direction: "desc",
      sortColumn: "",
      sortCol: "createTime",
      col: "",
      value: null,
      flag: "historic",
      search: "",
      searchQuery: "",
      alertId: "",
      from: 0,
      alert: 0,
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
      fields: [],
      exclude: [],
      selected: [
        "id",
        "effectedContainer",
        "description",
        "name",
        "createTime"
      ],
      dropvalues: [],
      totalAlerts: [],
      addedValues: [],
      fieldsData: [],
      finalFields: [],
      alerts: []
    };
  },
  methods: {
    executeSearch() {
      this.search = this.searchQuery;
      this.page = 1;
      this.fetchAlertlength();
      this.getAlerts(this.page);
    },
    sortTable: function(col) {
      this.page = 1;
      if (this.sortColumn === col && this.direction == "asc") {
        this.ascending = !this.ascending;
        this.direction = "desc";
      } else {
        this.ascending = true;
        this.direction = "asc";
        this.sortColumn = col;
      }
      var ascending = this.ascending;
      if (this.exclude.includes(this.sortColumn)) {
        this.sortCol = col;
      } else {
        this.sortCol = col + ".keyword";
      }
      this.getAlerts(this.page);
    },
    handleWindowResize(event) {
      this.windowHeight = event.currentTarget.innerHeight;
      this.windowWidth = event.currentTarget.innerWidth;
    },
    setPages(alert) {
      let numberOfPages = Math.ceil(alert / this.perPage);
      this.pages = [];
      for (let index = 1; index <= numberOfPages; index++) {
        this.pages.push(index);
      }
    },
    paginate(alerts) {
      let page = this.page;
      let perPage = this.perPage;
      this.from = page * perPage - perPage;
      let to = page * perPage;
      return alerts;
    },
    getPrevious() {
      this.page = this.page - 1;
      this.getAlerts(this.page);
    },
    getNext() {
      this.page = this.page + 1;
      this.getAlerts(this.page);
    },
    getAlerts: function(pageNumber) {
      let page = pageNumber;
      let perPage = this.perPage;
      this.from = page * perPage - perPage;
      this.fetchAlert(this.selected);
    },
    fetchAlertlength: function() {
      var _this = this;
      var uri = "/conflux/alertlength";
      var payload = {
        flag: this.flag,
        startDate: localStorage.getItem("startTime"), //this.startTime,
        endDate: localStorage.getItem("endTime"), //this.endTime,
        sourceList: this.selected,
        queryString: this.search,
        sortKey: this.sortCol,
        direction: this.direction,
        timeFilter: "createTime",
        profileSearch: this.getProfiles()
      };
      var headers = { headers: { "Content-Type": "application/json" } };
      _this.isLoading = true;

      this.axios
        .post(uri, payload, headers)
        .then(function(response) {
          _this.isLoading = false;
          _this.alert = response.data;
          if (_this.alert != "") {
            _this.setPages(_this.alert);
          }
        })
        .catch(error => {});
    },
    fetchAlert: function() {
      var _this = this;
      var uri = "/conflux/alerts";
      var payload = {
        flag: this.flag,
        startDate: localStorage.getItem("startTime"), //this.startTime,
        endDate: localStorage.getItem("endTime"), //this.endTime,
        sourceList: this.selected,
        queryString: this.search,
        sortKey: this.sortCol,
        direction: this.direction,
        size: this.perPage,
        from: this.from,
        timeFilter: "createTime",
        profileSearch: this.getProfiles()
      };
      var headers = {
        headers: { "Content-Type": "application/json" },
        responseType: "json",
        timeout: 30000
      };
      _this.isLoading = true;
      this.axios
        .post(uri, payload, headers)
        .then(function(response) {
          _this.isLoading = false;
          _this.alerts = response["data"];
        })
        .catch(error => {});
    },
    fetchFields: function() {
      var _this = this;
      var uri = "/conflux/alertfields";
      var payload = {};
      var headers = { headers: { "Content-Type": "application/json" } };
      this.axios
        .post(uri, payload, headers)
        .then(function(response) {
          var fieldObj = _this.sortByKey(response["data"], "name");
          _this.fields = fieldObj.map(function(item) {
            return item["name"];
          });
          if (_this.fields != "") {
            _this.numberFields();
          }
        })
        .catch(error => {});
    },
    sortByKey(array, key) {
      return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return x < y ? -1 : x > y ? 1 : 0;
      });
    },
    drop: function() {
      flag = this.flag;
    },
    pageLength: function() {
      let perPage = this.perPage;
      this.page = 1;
      this.setPages(this.alert);
      this.getAlerts(this.page);
    },
    numberFields() {
      var duplicate = [];
      this.finalFields = [];
      for (let i = 0; i < this.fields.length; i++) {
        if (this.selected.includes(this.fields[i])) {
          duplicate.push(this.fields[i]);
        } else {
          this.finalFields.push({
            val: this.fields[i],
            label: this.$options.filters.createSpaces(this.$options.filters.capitalize(this.fields[i]))
          });
        }
      }
      return this.finalFields;
    },
    getProfiles() {
      var profiles = JSON.parse(localStorage.getItem("profiles"));
      for (let i = 0; i < profiles.length; i++) {
        profiles[i] = profiles[i].id;
      }
      return profiles;
    },
    console: function() {
      this.search = "";
      if (this.dropvalues != "undefined" && this.dropvalues != "") {
        var length = this.dropvalues.length;
        for (var i = 0; i < length; i++) {
          if (this.selected.includes(this.dropvalues[i].val)) {
            var valueExists = this.dropvalues[i].val;
          } else {
            this.addedValues = this.dropvalues[i].val;
            this.selected = this.selected.concat(this.addedValues);
          }
        }
        this.dropvalues = "";
      } else {
        this.searchQuery = "";
        this.selected = [
          "id",
          "effectedContainer",
          "description",
          "name",
          "createTime"
        ];
      }
      this.numberFields();
      this.fetchAlert(this.selected);
    },
    rowselect: function(id) {
      this.alertId = id;
      this.$refs.alertDetailsModal.toggle();
    },
    formatValue: function(value) {
      if (value == undefined || value == null || value == "null" || value == "NULL")
        value = "";
      if (this.$moment(value, "YYYY-MM-DD\\THH:mm:ss\\Z").format("YYYY-MM-DD\\THH:mm:ss\\Z") === value) 
        value = this.$moment(value, "YYYY-MM-DD\\THH:mm:ss\\Z").format("YYYY/MM/DD HH:mm:ss \\G\\M\\T");
      return value;
    }
  },
  beforeDestroy: function() {
    window.removeEventListener("resize", this.handleWindowResize);
    this.$root.$off("updateGraphContents");
  },
  created: function() {
    this.search = "";
    this.fetchAlertlength();
    this.fetchFields();
    this.getAlerts(this.page);

    //Piggy backing here off the date/profile emit call to also refresh alert data on nav-bar updates.
    var self = this;
    this.$root.$off("updateGraphContents");
    this.$root.$on("updateGraphContents", data => {
      self.page = 1;
      self.fetchAlertlength();
      self.getAlerts(self.page);
    });
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
  mounted() {
    window.addEventListener("resize", this.handleWindowResize);
  }
};
</script>

<style type="text/scss" lang="scss" scoped>
@import "../assets/sass/custom-css/_global.scss";

#fieldsDropdownContainer {
  margin-right: 20px;
}
#fieldsDropdown {
  margin-top: 1px;
  display: inline-block;
  min-width: 265px;
  width: 100%;
  background-color: $ctl-white;
  border-radius: 4px;
  height: 36px;
  cursor: pointer !important;
}

table {
  border-collapse: collapse !important;
  margin-top: -8px;
  border: solid 1px #dddddd;
  overflow: hidden;
  background-color: white;
  border-radius: 4px;
  position: relative;
  table-layout: fixed;
  margin-top: 1px;
}

div.tablewrapper {
  height: 700px;
  overflow-y: auto;
  overflow-x: hidden;
}

.dropdown {
  height: 35px;
}

.highlight {
  background: #717699;
}

th {
  font-size: 14px;
  border-bottom: 2px solid #ddd;
  height: 4px;
  text-align: left;
  max-height: 150px;
  overflow: hidden;
  cursor: pointer;
}

tr:hover td {
  background-color: $ctl-light-gray;
  cursor: pointer;
}

td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  border-bottom: 1px solid #ddd;
  word-wrap: break-word;
}

tr {
  height: 1px;
}

.arrow_down {
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAaCAYAAABPY4eKAAAAAXNSR0IArs4c6QAAAvlJREFUSA29Vk1PGlEUHQaiiewslpUJiyYs2yb9AyRuJGm7c0VJoFXSX9A0sSZN04ULF12YEBQDhMCuSZOm1FhTiLY2Rky0QPlQBLRUsICoIN/0PCsGyox26NC3eTNn3r3n3TvnvvsE1PkwGo3yUqkkEQqFgw2Mz7lWqwng7ztN06mxsTEv8U0Aam5u7r5EInkplUol/f391wAJCc7nEAgE9Uwmkzo4OPiJMa1Wq6cFs7Ozt0H6RqlUDmJXfPIx+qrX69Ti4mIyHA5r6Wq1egND+j+IyW6QAUoul18XiUTDNHaSyGazKcZtdgk8wqhUKh9o/OMvsVgsfHJy0iWqVrcQNRUMBnd6enqc9MjISAmRP3e73T9al3XnbWNjIw2+KY1Gc3imsNHR0YV4PP5+d3e32h3K316TySQFoX2WyWR2glzIO5fLTSD6IElLNwbqnFpbWyO/96lCoai0cZjN5kfYQAYi5H34fL6cxWIZbya9iJyAhULBHAqFVlMpfsV/fHxMeb3er+Vy+VUzeduzwWC45XA4dlD/vEXvdDrj8DvURsYEWK3WF4FA4JQP9mg0WrHZbEYmnpa0NxYgPVObm5teiLABdTQT8a6vrwdRWhOcHMzMzCiXlpb2/yV6qDttMpkeshEzRk4Wo/bfoe4X9vb2amzGl+HoXNT29vZqsVi0sK1jJScG+Xx+HGkL4Tew2TPi5zUdQQt9otPpuBk3e0TaHmMDh1zS7/f780S0zX6Yni+NnBj09fUZUfvudDrNZN+GkQbl8Xi8RLRtHzsB9Hr9nfn5+SjSeWUCXC7XPq5kw53wsNogjZNohYXL2EljstvtrAL70/mVaW8Y4OidRO1/gwgbUMvcqGmcDc9aPvD1gnTeQ+0nmaInokRj0nHh+uvIiVOtVvt2a2vLv7Ky0tL3cRTXIcpPAwMDpq6R4/JXE4vFQ5FI5CN+QTaRSFCYc8vLy1l0rge4ARe5kJ/d27kYkLXoy2Jo4C7K8CZOsEBvb+9rlUp1xNXPL7v3IDwxvPD6AAAAAElFTkSuQmCC");
}
.arrow_up {
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAaCAYAAACgoey0AAAAAXNSR0IArs4c6QAAAwpJREFUSA21Vt1PUmEYP4dvkQ8JFMwtBRocWAkDbiqXrUWXzU1rrTt0bdVqXbb1tbW16C9IBUSmm27cODdneoXjputa6069qwuW6IIBIdLvdaF4OAcOiGeDc87zPs/vd57P96WpFq7p6enbGo1mjKZpeTabjU1MTCRagGnOZHFxcXxtbe1XKpUq7+zslJeXl//Mz8+Hy+Uy3RxSE9qTk5M3otFooVQqgef4Wl9f343FYoEmoISrxuNxFX5f9vb2jhn/PxUKhfLS0tIPfFifUESRUMV8Pv/M6XReRm5rTGQyGeXxeGxYe1ezeBpBOBx2rKysbO7v79d4Wy3Y2Nj4GQqFbgnhaugxwiuGJx99Pp9FLBbXxYTXvTqd7v3MzIy6riIWGxJnMpl7AwMD14xGYyMsSq1WUyQdUqn0eSPlusQIsbGrq+vl4OCgvhFQZd1utyv1en0gEolcqsi47nWJlUrlG5fLZVcoFFy2nDKSDpIWlUoVTCQSEk4lCHmJMZ2GTCbTiMVikfIZ88l7enoos9l8dXt7+z6fDicxSJUokqDX6xXcl2wCROoc0vQCWL3sNfLOSdzR0fHY4XC4tVotl40gmVwup9xuN4OQv+UyqCFGH9rg7SOGYVRcBs3IEG4J0nVnamrqOtvuBDGGgQg9+wHFcVEi4a0LNkbdd6TrPKo8ODc311mteIIYjT/a398/jK+s1jnVM0kXoufCFvq0GuiIGEVgQIhfoygM1QrteEa9dAL7ITiYCt4RMabOK5AyKKzKWtvupLcRciu8D5J0EuDDPyT/Snd39yh6VtY2NhYQSR9G79Ds7OxdskRjEyAufvb7/cPoO5Z6e1+xtVKrq6vfcFzyi/A3ZrPZ3GdNSlwgo5ekE4X2RIQGf2C1WlufFE0GBeGWYQ8YERWLxQtnUVB830MKLZfL9RHir8lkssCn2G751tZWEWe03zTKm15YWPiEiXXTYDB0Ig/t7yd8PRws4EicwWHxO4jHD8/C5HiTTqd1BwcHFozKU89origB+y/kmzgYpgOBQP4fGmUiZmJ+WNgAAAAASUVORK5CYII=");
}
.arrow {
  float: right;
  width: 12px;
  height: 15px;
  background-repeat: no-repeat;
  background-size: contain;
  background-position-y: bottom;
}

button.page-link {
  font-size: 10px;
  color: $ctl-dark-gray;
  font-weight: 500;
  display: inline-block;
}

.pagination {
  list-style: none;
  margin: 0;
  padding: 0;
  text-align: center;
}

.pagination > li > .page-item:active {
  background-color: #474949;
  border-color: #dddddd;
  color: #ffffff;
}
.pagination > li > button.page-link:hover {
  background-color: #474949 !important;
  border-color: #474949;
  color: #ffffff;
}

.page-item {
  display: inline-block;
  // border: 1px solid #D5D5D5;
  box-sizing: border-box;
  margin-left: -1px;
  margin-top: 5px;
}

.active {
  background: $ctl-light-gray;
}

.resetButton {
  min-width: 10px !important;
}

:disabled{
  cursor: not-allowed!important;
}
</style>
