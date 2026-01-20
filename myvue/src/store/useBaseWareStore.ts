import { defineStore } from 'pinia'
import { WarehouseData } from '@/types/warehouse' 

export const useSharedStore = defineStore('tableRow', {
    
    state:()=>{
        
        return{
            row:<WarehouseData>{}
        }
    },
    actions:{},
    getters:{}

})