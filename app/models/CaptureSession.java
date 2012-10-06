package models;


import play.db.jpa.Model;

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
    @OneToMany
    //@OrderColumn
    public List<CapturedGesture> gestures;
    @ManyToOne
    public ScreenResolution screenRes;
    
    public CaptureSession(List<CapturedGesture> gestures,ScreenResolution res){
        this.gestures = gestures;
        screenRes = res;
    }

}
