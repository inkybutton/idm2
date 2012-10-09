import models.*;
import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Before;
import org.junit.Test;
import play.test.UnitTest;
import utils.GestureListBinder;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * User: Noel Zeng.
 * Part of PACKAGE_NAME.
 */
public class CSVConversionTest extends UnitTest {
    Touch t;
    Action a;
    ObjectMapper m;
    JsonFactory f;
    GestureListBinder b;
    
    @Before
    public void setup(){
        //a = new Action("play");
        a = new Action("play");
        a.save();
        m = new ObjectMapper();
        f = new JsonFactory();
        b = new GestureListBinder();
        CapturedGesture g = createGesture();
        List<CapturedGesture> l = new ArrayList<CapturedGesture>();
        l.add(g);
        t = g.touchesOverTime.get(0).getHashedTouches().get("392");
        CaptureSession s = new CaptureSession(l,new ScreenResolution(1920,800));
        g.session = s;
        s.save();
    }
    
    @Test
    public void csvEntryTest(){
        //System.out.println(t.toCSVEntry());
        assertTrue(t.toCSVEntry().contains("1920,800,play,3819,392,32,99\r\n"));
    }
    
    @Test
    public void csvTouchFragmentTest(){
        assertTrue(t.toCSVFragment().equals("392,32,99"));
    }

    @Test
    public void sessionCSVDownloadTest(){
        try {
            String csv = "";
            List<CaptureSession> ss = CaptureSession.getDownloaded();
            for (CaptureSession s:ss){
                String currentSessionCSV =  s.downloadCSV().call();
                assertTrue(s.isDownloaded == true);
                assertTrue(csv.contains(s.screenRes.x + ","+s.screenRes.y));
                csv += currentSessionCSV;
            }
        } catch (Exception e){
            fail();
        }
        //assertTrue(csv.contains("405,39,51"));
        
    }
    
    private CapturedGesture createGesture(){
        String json = "{\"gid\":\"play\",\"captured\":[{\"time\":3819,\"touches\":[{\"fid\":392,\"coords\":{\"x\":32,\"y\":99}}," +
                "{\"fid\":405,\"coords\":{\"x\":39,\"y\":51}}]},{\"time\":4011," +
                "\"touches\":[{\"fid\":392,\"coords\":{\"x\":32,\"y\":99}},{\"fid\":405,\"coords\":{\"x\":39,\"y\":51}}]}]}";
        CapturedGesture g = null;
        try {
            JsonParser p = f.createJsonParser(json);
            JsonNode r = m.readTree(p);
            g = b.deserialiseGesture(r);
        } catch (IOException e){
            e.printStackTrace();
            fail();
        }
        return g;
    }
}
