package models;

import play.db.jpa.Model;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;

/**
 * User: Noel Zeng.
 * Part of models.
 */
@Entity
public class CapturedGesture extends Model {
    @ManyToOne
    public Action action;
    @ManyToOne
    public CaptureSession session;
    @OneToMany(mappedBy="gesture", cascade= CascadeType.ALL)
    public List<GestureInstant> touchesOverTime;
    public CapturedGesture(Action action){
        touchesOverTime = new ArrayList<GestureInstant>();
        this.action = action;
    }
    
    public CapturedGesture addInstant(GestureInstant i){
        this.touchesOverTime.add(i);
        i.save();
        this.save();
        return this;
    }
    
}
