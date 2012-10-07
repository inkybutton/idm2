package models;

import play.db.jpa.Model;

import javax.persistence.Entity;
import java.util.Date;
import java.util.List;

/**
 * User: Noel Zeng.
 * Part of models.
 */
@Entity
public class RecordRange extends Model {
    public CaptureSession start;
    public CaptureSession end;
    public Date creationDate;

    public RecordRange(CaptureSession start,CaptureSession end){
        creationDate = new Date();

    }

    public List<CaptureSession> getRange(){
        return null;
    }
    
    public static List<RecordRange> allDownloadedRanges(){
        return RecordRange.all().fetch();
        
    }
    
    public static RecordRange undownloadedRange(){
        return null;
    }
}
