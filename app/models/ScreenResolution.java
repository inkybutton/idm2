package models;

import play.db.jpa.Model;

import javax.persistence.Entity;

/**
 * User: Noel Zeng.
 * Part of models.
 */

@Entity
public class ScreenResolution extends Model {

    public int x;
    public int y;
    
    public ScreenResolution(int x,int y){
        this.x = x;
        this.y = y;
    }
}
