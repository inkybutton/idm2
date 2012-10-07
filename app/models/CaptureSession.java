package models;


import play.db.jpa.Model;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import java.util.List;

/**
 * User: Noel Zeng.
 * Part of models.
 */
@Entity
public class CaptureSession extends Model {
    @OneToMany(mappedBy = "session",cascade = CascadeType.ALL)
    public List<CapturedGesture> gestures;
    @ManyToOne(cascade = CascadeType.PERSIST)
    public ScreenResolution screenRes;
    
    public CaptureSession(List<CapturedGesture> gestures,ScreenResolution res){
        this.gestures = gestures;
        for (CapturedGesture g:gestures){
            g.session = this;
        }
        screenRes = res;
    }

}
