<template  id="modal-template">
  <transition name="modal" v-if="showModal">
    <div class="modal-mask" v-on:mousedown="toggle()">
      <div class="modal-wrapper">
        <div class="modal-container" v-bind:style="{width: modalWidth, height: modalHeight, 'overflow-y': modalScroll}" v-on:mousedown.stop>

          <div class="modal-header">
            <h4>
              <slot name="header">
                REPLACE HEADER
              </slot>
            </h4>
            <!-- <div class="modal-x-button" v-on:click="toggle()"><fai class="icon" icon="times" /></div> -->
          </div>

          <div class="modal-body">
            <slot name="body"> 
              REPLACE BODY
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              REPLACE FOOTER
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ModalBase',
  data() {
    return {
        showModal: false,
        modalWidth: "800px",
        modalHeight: "auto",
        modalScroll:"none"
    };
  },
  methods: {
      toggle(){
          this.showModal = !this.showModal;
          this.modalWidth = "800px";
      },
      setModalWidth(width){
        this.modalWidth = width;
      },
      setModalHeight(height){
        this.modalHeight = height;
        this.modalScroll = "scroll";
      }
  },
};
</script>

<style type="text/scss" lang="scss" scoped>
@import "../../assets/sass/custom-css/_global.scss";

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .2s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 800px;
  /* min-height:400px; */
  margin: 0px auto;
  padding: 10px;
  background-color: $ctl-white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .2s; 
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header{
  padding:10px;
}
.modal-header h4 {
  margin: 0;
  padding:0px;
  font-size: 26px;
  color:$ctl-vibrant-blue;
}

.modal-body {
  margin: 20px 0;
}

.modal-x-button{
  cursor:pointer;
  margin-top:5px;
}
.modal-x-button:hover{
  color:rgb(98, 98, 98);
}
.modal-x-button .icon{
  color:#212529;
}

.modal-default-button {
  float: right;
}
.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}
</style>