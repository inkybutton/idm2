package models;

import org.apache.commons.lang.StringUtils;
import play.db.jpa.Model;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;

/**
 * User: Noel Zeng.
 * Part of models.
 * A Touch is a coordinate on a screen made by a user.
 * It contains the identifier of the finger that touched the screen,
 * as well as a coordinate.
 * A Touch is associated with a particular captured gesture instant, as the
 * finger identifier is not unique across touches.
 * We assume an identifier is unique as long as any finger causing the
 * touch is in contact with the device. This is the worst-case scenario
 * and prevents problems with uniqueness of ID.
 */
@Entity
public class Touch extends Model {
    //public Point coord;
    public int x;
    public int y;
    public String identifier;
    @ManyToOne
    public GestureInstant instant;
    
    public Touch(){

    }
    
    public Touch(int x, int y, String id,GestureInstant instant){
        this.x = x;
        this.y = y;
        this.identifier = id;
        this.instant = instant;
    }

    /**
     *
     * @return A CSV row with the following format:
     * Session_id screen_width screen_height gesture_id time_elapsed fid x y
     * Session_id - is a unique integer id for each gesture capture session. Each session is defined as a set of captured gestures made by a user on a touch-enabled device. (I.e. every time a user launches IDM2 and runs through it, it is counted as a session). In the csv file, two rows are from the same session if their session_id are the same.

    screen_width - is the width of the screen of the touch device used during the session. This is necessary as multiple devices have different sized screens - in order to work out the magnitude of the gestures made across different sizes (e.g. a large swipe across a small screen may be just a medium one in terms of a bigger screen ) we need to know the screen size. Even across ipads, there are different sizes across different generations.

    screen_height - is the height of the screen of the touch device used during the session .

    Gesture_id - a string name for the gesture the user is asked to design at current session. E.g. "play". In the csv file, two rows are for the same gesture if they have the same gesture_id .

    Time_elapsed - time elapsed since the user started performing the gesture in milliseconds as  integer.

    Fid - an integer id identifying the finger or other touch mechanism used to make the touch. The id is unique within the same session during the same gesture.

    X - an integer representing the x-coordinate of the finger touching the screen at elapsed time.
    Y - an integer representing the y-coordinate of the finger touching the screen at elapsed time.
     */
    public String toCSVEntry(){
        CaptureSession session = instant.gesture.session;
        String[] s = {""+session.id,""+session.screenRes.x,
                ""+session.screenRes.y,instant.gesture.action.name,
                ""+instant.timeElapsed,this.identifier,""+this.x,""+this.y};
        return StringUtils.join(s,',') + "\r\n";
    }

    public static String toCSVEntry(Touch t){
        CaptureSession session = t.instant.gesture.session;
        String[] s = {""+session.id,""+session.screenRes.x,
                ""+session.screenRes.y,t.instant.gesture.action.name,
                ""+t.instant.timeElapsed,t.identifier,""+t.x,""+t.y};
        return StringUtils.join(s,',') + "\r\n";
    }
    
    public String toCSVFragment(){
        String[] s = {this.identifier,""+this.x,""+this.y};
        return StringUtils.join(s,',');
    }
}
