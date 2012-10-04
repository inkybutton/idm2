package models;

import play.db.jpa.Model;

import javax.persistence.Entity;

/**
 * User: Noel Zeng.
 * Part of models.
 */
@Entity
public class Action extends Model {
    //@Id
    //private Long actionId;
    public String name;
    public Action(String name){
        this.name = name;
    }
    
    public Action getAction(String name){
        return Action.find("byName",name).first();
    }
}
