import { defineStore } from 'pinia'

export const useSharedStore = defineStore('tableRow', {
    state:()=>{
        return{
            row:[]
        }
    },
    actions:{},
    getters:{}

})