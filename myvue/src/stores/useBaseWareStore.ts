import { defineStore } from 'pinia'
import type { WarehouseData } from '@/types' 

export const useSharedStore = defineStore('tableRow', {
    
    state:()=>{
        
        return{
            row:<WarehouseData>{}
        }
    },
    actions:{},
    getters:{}

})