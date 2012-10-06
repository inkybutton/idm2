package models;

import play.db.jpa.Model;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OrderColumn;

/**
 * User: Noel Zeng.
 * Part of models.
 */
@Entity
public class CapturedGesture extends Model {
    @OneToMany
    @OrderColumn
    public GestureInstant[] touchesOverTime;
    @ManyToOne
    public Action action;

    public CapturedGesture(GestureInstant[] gesture,Action action){
        touchesOverTime = gesture;
        this.action = action;
    }
    
}
