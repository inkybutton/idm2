import models.Action;
import models.CapturedGesture;
import models.GestureInstant;
import models.Touch;
import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Before;
import org.junit.Test;
import play.test.UnitTest;
import utils.GestureListBinder;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;

/**
 * User: Noel Zeng.
 * Part of PACKAGE_NAME.
 */
public class JsonDeserialisationTest extends UnitTest {

    GestureListBinder b;
    Action a;
    CapturedGesture g;
    GestureInstant i;    
    ObjectMapper m;
    JsonFactory f;
    @Before
    public void setup(){
        b = new GestureListBinder();
        a = new Action("play");
        a.save();
        g = new CapturedGesture(a);
        i = new GestureInstant(93248,g);
        m = new ObjectMapper();
        f = new JsonFactory();
    }
    
    @Test
    public void deserialiseGestureTest(){
        String json = "{\"gid\":\"play\",\"captured\":[{\"time\":3819,\"touches\":[{\"fid\":392,\"coords\":{\"x\":32,\"y\":99}}," +
                "{\"fid\":405,\"coords\":{\"x\":39,\"y\":51}}]},{\"time\":4011," +
                "\"touches\":[{\"fid\":392,\"coords\":{\"x\":32,\"y\":99}},{\"fid\":405,\"coords\":{\"x\":39,\"y\":51}}]}]}";
        try {
            JsonParser p = f.createJsonParser(json);
            JsonNode r = m.readTree(p);
            CapturedGesture g = b.deserialiseGesture(r);
            assertEquals(g.action.name,"play");
            
        } catch(IOException e){
            fail();
            e.printStackTrace();
        }
    }
    
    @Test
    public void deserialiseInstantsTest(){
        String json = "[{\"time\":3819,\"touches\":[{\"fid\":392,\"coords\":{\"x\":32,\"y\":99}}," +
                "{\"fid\":405,\"coords\":{\"x\":39,\"y\":51}}]},{\"time\":4011," +
                "\"touches\":[{\"fid\":392,\"coords\":{\"x\":32,\"y\":99}},{\"fid\":405,\"coords\":{\"x\":39,\"y\":51}}]}]";
        try {
            JsonParser p = f.createJsonParser(json);
            JsonNode r = m.readTree(p);
            List<GestureInstant> i = b.deserialiseInstants(r,g);
            assertTrue(i.size() == 2);
        } catch (IOException e){
            fail();
            e.printStackTrace();
        }
    }
    
    @Test
    public void deserialiseInstantTest(){
        String json = "{\"time\":3819,\"touches\":[{\"fid\":392,\"coords\":{\"x\":32,\"y\":99}},{\"fid\":405,\"coords\":{\"x\":39,\"y\":51}}]}";
        try {
            JsonParser p = f.createJsonParser(json);
            GestureInstant i = b.deserialiseInstant(m.readTree(p),g);
            assertEquals(i.timeElapsed,3819);
            HashMap<String,Touch> r = i.getHashedTouches();
            assertTrue(r.size() == 2);
            Touch first = r.get("392");
            Touch sec = r.get("405");
            assertEquals(first.identifier,"392");
            assertTrue(first.x == 32);
            assertTrue(first.y == 99);
            assertEquals(sec.identifier,"405");
            assertTrue(sec.x == 39);
            assertTrue(sec.y == 51);
        } catch (IOException e){
            fail();
            e.printStackTrace();
        }
    }
    
    @Test()
    public void deserialiseTouchesTest(){
        String json = "[{\"fid\":392,\"coords\":{\"x\":32,\"y\":99}},{\"fid\":405,\"coords\":{\"x\":39,\"y\":51}}]";
        try {
            JsonParser p = f.createJsonParser(json);
            List<Touch> r = b.deserialiseTouches(m.readTree(p),i);
            assertTrue(r.size() == 2);
            Touch first = r.get(0);
            Touch sec = r.get(1);
            assertEquals(first.identifier,"392");
            assertTrue(first.x == 32);
            assertTrue(first.y == 99);
            assertEquals(sec.identifier,"405");
            assertTrue(sec.x == 39);
            assertTrue(sec.y == 51);
        } catch (IOException e){
            fail();
            e.printStackTrace();
        }
    }

    @Test
    public void deserialiseTouchTest(){

        String jsonContent = "{\"fid\":392,\"coords\":{\"x\":45,\"y\":48}}";
        try {
            JsonParser p = f.createJsonParser(jsonContent);
            JsonNode root = m.readTree(p);
            Touch result = b.deserialiseTouch(root,i);
            //System.out.println(result.identifier);
            assertEquals(result.identifier,"392");
            assertTrue(result.x == 45);
            assertTrue(result.y == 48);
        } catch (IOException e) {
            fail();
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }
    }
}
