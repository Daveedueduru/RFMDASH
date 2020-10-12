<template>
<div>
      <div id="loginLogoContainer">
        <img src="@/assets/img/lmnlogo.png" alt="">
      </div>
    <div id="loginContainer">
        <h2>RFM Dashboard</h2>
        <input :disabled="loading" type="text" id="loginUsernameInput" class="form-control" name="username" v-model="input.username" placeholder="CUID" />
        <input :disabled="loading" type="password" id="loginPasswordInput" class="form-control" name="password" v-model="input.password" v-on:keydown.enter="login()" placeholder="Password" />
        <button :disabled="loading" type="button" id="loginSubmitButton" class="btn btn-info" v-on:click="login()">
            <span v-if="!loading">Login</span>
            <span v-else>Logging in...</span>
        </button>
        <div id="errorMessage" v-if="errorMessage!=''" v-bind:text="errorMessage">{{errorMessage}}</div>
    </div>
      <div id="backgroundPathwayContainer">
        <img src="@/assets/img/pathways.png" alt="">
      </div>
    <div id="bottomStripeContainer">
        <div class="row" id="bottomStripe">
            <div class="col-sm-2" style="height:100%;background-color:#38c6f4;"></div>
            <div class="col-sm-4" style="height:100%;background-color:#0c9ed9;"></div>
            <div class="col-sm-6" style="height:100%;background-color:#0075c9;"></div>
        </div>
    </div>
</div>
</template>

<script>
    export default {
        name: 'Login',
        data() {
            return {
                input: {
                    username: "",
                    password: ""
                },
                mockAuthAuth: {
                    username: "123",
                    password: "123"
                },
                errorMessage: "",
                loading: false
            }
        },
        methods: {
            login() {
                this.errorMessage = "";
                if(this.input.username == "" || this.input.password == ""){
                    this.errorMessage = "You must enter a username and password!";
                    return;
                }
                this.input.username = this.input.username.toLowerCase();

                // Special login for creating defaults graphs
                if(this.input.username.includes("defaults")){
                    if(this.input.password == 'minnows'){
                        this.$cookie.set('auth', '1', 7);
                        localStorage.setItem('token', "TempToken");
                        localStorage.setItem('username', this.input.username);
                        localStorage.setItem('fullname', this.input.username.toUpperCase());
                        this.$emit("authenticated", true);
                    }else{
                        this.errorMessage = "Your password is incorrect!";
                        this.input.password = "";  
                    }
                    this.loading = false;
                    return;
                }
                
                var uri = '/conflux/login';
                var payload = {};
                var headers = { headers: {'Content-Type':'application/json', 'Authorization': "Basic " + btoa(this.input.username + ":" + this.input.password)} };

                var self = this;
                this.loading = true;
                this.axios.post( uri , payload , headers
                ).then(function (response) {
                    response = response.data;
                    var buildToken = self.input.username + ":" + response.l3_SESSION_ID + ":" + response.l3_TOKEN;
                    self.$cookie.set('auth', '1', 7);
                    localStorage.setItem('token', buildToken);
                    localStorage.setItem('username', self.input.username);
                    localStorage.setItem('fullname', response.firstname + " " + response.lastname);
                    self.axios.defaults.headers.common['l3_TOKEN'] = buildToken;
                    self.$emit("authenticated", true);
                }).catch(function (error) {
                    console.log(error.toString());
                    if(error.toString().includes("status code 401"))
                        self.errorMessage = "Your username or password is incorrect.";
                    else if(error.toString().includes("status code 403"))
                        self.errorMessage = "You are not authorized to view this site.";
                    else   
                        self.errorMessage = "An error occurred.";
                    self.input.password = "";
                }).then(function (response) {
                    self.loading = false;
                });
                return;
            }
        }
    }
</script>

<style type="text/scss" lang="scss" scoped>
@import "../assets/sass/custom-css/_global.scss";
    #loginLogoContainer{
        width:375px;
        padding:15px;
    }
    #loginLogoContainer img{
        width:100%;
        height:100%;
        display: inline-block;
    }
    #bottomStripeContainer{
        position: fixed;
        bottom:0px;
        width:100%;
    }
    #bottomStripe{
        height:10px;
        margin:0px;
    }
    #loginContainer {
        width: 600px;
        left: calc(50% - 300px); // Half of width
        margin: auto;
        position: absolute;
        float:left;
        top: 28%;
        padding: 25px;
        border-radius: 4px;
        border:solid 1px $ctl-border-gray;
        background-color: $ctl-white;
        min-height:275px;
        border-radius:4px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, .1);
    }
    #loginUsernameInput{
        margin-bottom:15px;
    }
    #loginPasswordInput{
        margin-bottom:15px;
    }
    #loginSubmitButton{
        width:100%;
    }
    #errorMessage{
        margin-top:20px;
        margin-left:1px;
    }
    #backgroundPathwayContainer{
        position: absolute;
        display:none!important;
        right:0px;
        bottom:10px;
        z-index:-100;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    #backgroundPathwayContainer img{
        width:100%;
        height:100%;
    }
</style>