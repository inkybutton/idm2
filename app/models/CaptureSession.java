package models;


import play.db.jpa.Model;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import java.util.List;
import java.util.concurrent.Callable;

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
    public Boolean isDownloaded;
    
    public static List<CaptureSession> getDownloaded(){
        return CaptureSession.find("byIsDownloaded",true).fetch();
    }
    
    public static List<CaptureSession> getNotDownloaded(){
        return CaptureSession.find("isDownloaded",false).fetch();
    }

    public CaptureSession(List<CapturedGesture> gestures,ScreenResolution res){
        this.gestures = gestures;
        this.isDownloaded = false;
        for (CapturedGesture g:gestures){
            g.session = this;
        }
        screenRes = res;
    }

    public Callable<String> asCSV(){
        return new Callable<String>() {
            @Override
            public String call() {
                String s = "";
                for (CapturedGesture g:gestures){
                    for (GestureInstant i:g.touchesOverTime){
                        for (Touch t:i.touches){
                            s += t.toCSVEntry();
                        }
                    }
                }
                return s;
            }
        };
    }

    public Callable<String> downloadCSV(){
        return new Callable<String>() {
            @Override
            public String call() throws Exception {
                String r = asCSV().call();
                isDownloaded = true;
                save();
                return r;
            }
        };
    }
}
