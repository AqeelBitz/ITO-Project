<template>
  <div v-if="visible" class="el-overlay is-message-box" style="z-index: 2006;">
    <div class="el-overlay-message-box">
      <div role="dialog" aria-label="Message" aria-modal="true" class="el-message-box is-draggable">
        <div class="el-message-box__header">
          <div class="el-message-box__title">
            <span class="msg-text">{{ title }}</span>
          </div>
        </div>
        <div class="el-message-box__content">
          <div class="el-message-box__container">
            <p v-html="content" class="p-text"></p>
          </div>
          <div class="el-message-box__input" style="display: none;">
            <div class="el-input"><input class="el-input__inner" type="text" autocomplete="off" placeholder=""></div>
            <div class="el-message-box__errormsg" style="visibility: hidden;"></div>
          </div>
        </div>
        <div class="el-message-box__btns">
          <button @click="$emit('close')" class="el-button" type="button">
            <span class="">OK</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Message',
  },
  content: {
    type: String,
    default: '', 
  },
  type: {
    type: String,
    default: 'info',
  }
});

const emit = defineEmits(['close']);
</script>
<style>
.el-overlay.is-message-box {
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2006;
}

.el-message-box {
  width: 90%;
  max-width: 500px;
  background-color: #ffffff;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  flex-direction: column;
}

.el-message-box__header {
  background-color: #007a3b;
  padding: 10px 15px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.el-message-box__title {
  color: white !important;
  font-weight: bold;
  font-size: 1em;
  padding-left: 0;
  margin-bottom: 0;
  --el-messagebox-title-color: white;
}

.msg-text {
  font-weight: bold;
}

.el-message-box__content {
  margin-top: 0;
  padding: 15px;
  color: #333;
  font-size: 14px;
  overflow: hidden;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.el-message-box__container {
  max-height: calc(80vh - 100px);
  overflow-y: auto;
  padding-right: 5px;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #cccccc;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f4f4f4;
  }

  scrollbar-width: thin;
  scrollbar-color: #cccccc #f4f4f4;
}

.el-message-box__message {
  display: block;
}

.p-text {
  color: #333;
  height: auto;
  line-height: 1.5;
  font-size: 0.9em;
  max-height: 67vh;

}

.el-message-box__btns {
  justify-content: flex-end;
  padding: 10px 15px 10px 0;
  border-top: 1px solid #f4f4f4;
  flex-shrink: 0;
}

.el-message-box__btns .el-button {
  background-color: #00a651;
  border-color: #00a651;
  color: white;
  font-weight: bold;
  border-width: 1px;
  border-radius: 4px;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
  --el-button-hover-border-color: #007a3b;
  --el-button-hover-bg-color: #007a3b;
  --el-button-active-border-color: #007a3b;
  --el-button-active-bg-color: #007a3b;
  padding: 8px 15px;
  height: auto;
}

button {
  cursor: pointer;
}

@media (min-width: 768px) {


  .heading h1 {
    font-size: 2em;
  }

  .upload-container {
    margin: 0vw 5vw;
    padding: 20px;
    width: auto;
    max-width: none;
  }

  .upload-container .el-upload {
    margin-bottom: 20px;
    flex-wrap: nowrap;
  }

  .upload-tip {
    margin-top: 0;
    font-size: 0.9em;
    width: auto;
  }

  .file-name {
    margin-top: 15px;
  }

  .error-message {
    margin-top: 15px;
    padding: 10px;
  }

  .tablecsv {
    margin-top: 20px;
    overflow-x: visible;
    max-height: none;
    overflow-y: visible;
  }

  .el-table td.el-table__cell,
  .el-table th.el-table__cell {
    padding: 12px 15px;
  }

  .el-table td.el-table__cell {
    white-space: normal;
    word-break: break-word;
  }

  .el-table__header-wrapper th.el-table__cell {
    text-align: center;
    padding: 12px 15px;
  }

  .tablecsv+div {
    margin-top: 20px !important;
    justify-content: flex-start;
    flex-wrap: nowrap;
  }

  .empty-state {
    margin-top: 20px;
    font-size: 1em;
  }

  .el-overlay.is-message-box {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .el-message-box {
    width: 500px;
    max-width: none;
  }

  .el-message-box__header {
    padding: 15px 24px;
  }

  .el-message-box__title {
    font-size: 1.1em;
  }

  .el-message-box__content {
    padding: 24px;
  }

  .el-message-box__container {
    max-height: calc(80vh - 120px);
    padding-right: 10px;
  }

  .p-text {
    line-height: 1.6;
    font-size: 1em;
    max-height: 67vh;

  }

  .el-message-box__btns {
    padding: 15px 24px 15px 0;
  }
}
</style>