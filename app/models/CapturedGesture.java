package models;

import play.db.jpa.Model;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import java.util.HashMap;

/**
 * User: Noel Zeng.
 * Part of models.
 */
@Entity
public class CapturedGesture extends Model {

    public HashMap<Long,Touches> touchesOverTime;
    @ManyToOne
    public Action action;

    public CapturedGesture(HashMap<Long, Touches> gesture,Action action){
        touchesOverTime = gesture;
        this.action = action;
    }
    
}
