package models;

import play.db.jpa.Model;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * User: Noel Zeng.
 * Part of models.
 */
@Entity
public class GestureInstant extends Model {
    public long timeElapsed;
    @ManyToOne
    public CapturedGesture gesture;
    @OneToMany(mappedBy="instant",cascade= CascadeType.ALL)
    public List<Touch> touches;

    public GestureInstant(long time,CapturedGesture associatedGesture){
        timeElapsed = time;
        gesture = associatedGesture;
        touches = new ArrayList<Touch>();
    }
    
    public GestureInstant addTouch(Touch newTouch){
        newTouch.save();
        this.touches.add(newTouch);
        this.save();
        return this;
    }

    public HashMap<String,List<Touch>> getTouches(){
        HashMap<String,List<Touch>> h = new HashMap<String, List<Touch>>();
        for (Touch t:touches){
            if (h.get(t.identifier) == null){
                h.put(t.identifier,new ArrayList<Touch>(5));
            }
            List<Touch> l = h.get(t.identifier);
            l.add(t);
        }
        return h;
    }
    
}
