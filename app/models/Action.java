package models;

import play.db.jpa.Model;

import javax.persistence.Entity;

/**
 * User: Noel Zeng.
 * Part of models.
 */
@Entity
public class Action extends Model {
    public String name;
    public Action(String name){
        this.name = name;
    }

    public static Action getOrCreate(String name){
        Action a = Action.find("byName",name).first();
        if (a == null){
            a = new Action(name);
            a.save();
        }
        return a;
    }
}
