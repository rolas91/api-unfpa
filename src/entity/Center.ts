import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export default class Center{
    
    @PrimaryGeneratedColumn()
     nid: string;

    @Column()
    field_name: string;
    
    @Column()
    field_address_field_1: string;
   
    @Column()
    field_address_field_2: string;
    
    @Column()
    field_country: string;
  
    @Column()
    field_city: string;
    
    @Column()
    field_municipal_region: string;
   
    @Column()
    field_postal_code: string;
    
    @Column()
    field_telephone: string;
    
    @Column()
    field_timezone: string;
   
    @Column()
    ield_hours_of_operation: string;
    
    @Column()
    field_service_provided: string;
    
    @Column()
    field_primary_doctor: string;
    
    @Column()
    field_primary_nurse: string;
    
    @Column()
    field_latitude: string;
    
    @Column()
    field_longitude: string;
    
    @Column()
    field_service_provided_1: string;
    
    @Column()
    uuid: string
}