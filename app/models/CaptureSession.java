package models;


import play.db.jpa.Model;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;

/**
 * User: Noel Zeng.
 * Part of models.
 */
@Entity
public class CaptureSession extends Model {
    @OneToOne
    public CapturedGesture[] gestures;
    @ManyToOne
    public ScreenResolution screenRes;
    
    public CaptureSession(CapturedGesture[] gestures,ScreenResolution res){
        this.gestures = gestures;
        screenRes = res;
    }

}
