import play.jobs.Job;
import play.jobs.OnApplicationStart;

/**
 * User: Noel Zeng.
 * Part of PACKAGE_NAME.
 */
@OnApplicationStart
public class MocksBootstrap extends Job {
    public void doJob(){
        //if (Action.count() == 0){
        //    Fixtures.loadModels("data.yml");

        //}
    }
}
