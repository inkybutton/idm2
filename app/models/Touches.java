/*
Touches represents the set of touches at a given time.
 */

package models;

import play.db.jpa.Model;

import javax.persistence.Entity;
import java.awt.*;

/**
 * User: Noel Zeng.
 * Part of models.
 */
@Entity
public class Touches extends Model {
    //    @Id
    //private Long touchId;
    public Point[] touches;

    public Touches(Point[] touches){
        //this.touches = touches;
        //new JsonDeserializer().deserialize()

    }
    
}
